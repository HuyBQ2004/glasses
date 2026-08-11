import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Vui lòng đăng nhập để thanh toán' }, { status: 401 });
    }

    const { name, phone, address, note, voucherCode, paymentMethod = 'COD' } = await req.json();

    if (!name || !phone || !address) {
      return NextResponse.json({ success: false, error: 'Vui lòng điền đầy đủ thông tin nhận hàng' }, { status: 400 });
    }

    // 1. Get cart items
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('account_id', user.id);

    if (cartError || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ success: false, error: 'Giỏ hàng của bạn đang trống' }, { status: 400 });
    }

    let subtotal = 0;
    const orderItems: Array<{ product: any; amount: number; price: number }> = [];

    for (const item of cartItems) {
      const prod = item.product;
      if (prod && prod.quantity >= item.amount) {
        subtotal += prod.price * item.amount;
        orderItems.push({
          product: prod,
          amount: item.amount,
          price: prod.price,
        });
      } else {
        return NextResponse.json({
          success: false,
          error: `Sản phẩm "${prod?.name || 'Giày'}" không đủ số lượng trong kho.`,
        }, { status: 400 });
      }
    }

    // 2. Discount handling
    let discountAmount = 0;
    if (voucherCode) {
      const upperCode = voucherCode.toUpperCase();
      const { data: voucher } = await supabase
        .from('vouchers')
        .select('*')
        .eq('code', upperCode)
        .maybeSingle();

      if (!voucher) {
        return NextResponse.json({ success: false, error: 'Mã giảm giá không tồn tại' }, { status: 400 });
      }

      if (new Date(voucher.expiry_date) <= new Date()) {
        return NextResponse.json({ success: false, error: 'Mã giảm giá này đã hết hạn sử dụng' }, { status: 400 });
      }

      if (subtotal < (voucher.min_order_value || 0)) {
        return NextResponse.json({
          success: false,
          error: `Đơn hàng chưa đạt giá trị tối thiểu (${Number(voucher.min_order_value).toLocaleString('vi-VN')}đ) để dùng mã này.`,
        }, { status: 400 });
      }

      // First-order check for KINH20
      if (upperCode === 'KINH20') {
        const { count: orderCount } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('account_id', user.id);

        if (orderCount && orderCount > 0) {
          return NextResponse.json({
            success: false,
            error: 'Mã ưu đãi KINH20 chỉ áp dụng cho đơn hàng đầu tiên của bạn!',
          }, { status: 400 });
        }
      }

      discountAmount = (subtotal * voucher.discount_percent) / 100;
      if (voucher.max_discount && discountAmount > voucher.max_discount) {
        discountAmount = voucher.max_discount;
      }
    }

    const vatPercent = 10;
    const vatAmount = ((subtotal - discountAmount) * vatPercent) / 100;
    const totalPrice = Math.round(subtotal - discountAmount + vatAmount);

    // Get default store
    const { data: stores } = await supabase.from('stores').select('*').limit(1);
    const store = stores && stores.length > 0 ? stores[0] : null;

    // 3. Create Shipping
    const { data: shipping, error: shippingError } = await supabase
      .from('shippings')
      .insert({
        name,
        phone,
        address,
        status: 'Pending',
        store_id: store?.id || null,
        shipper_id: store?.shipper_id || null,
      })
      .select()
      .single();

    if (shippingError || !shipping) {
      return NextResponse.json({ success: false, error: shippingError?.message || 'Không thể tạo thông tin giao hàng' }, { status: 500 });
    }

    // 4. Create Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        account_id: user.id,
        total_price: totalPrice,
        note,
        shipping_id: shipping.id,
        store_id: store?.id || null,
        vat_percent: vatPercent,
        payment_method: paymentMethod,
        payment_status: 'Pending',
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json({ success: false, error: orderError?.message || 'Không thể tạo đơn hàng' }, { status: 500 });
    }

    // 5. Create OrderDetails & Deduct Product Quantities
    for (const item of orderItems) {
      await supabase.from('order_details').insert({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.image,
        product_price: item.price,
        quantity: item.amount,
      });

      // Deduct quantity
      const newQuantity = Math.max(0, item.product.quantity - item.amount);
      await supabase
        .from('products')
        .update({ quantity: newQuantity })
        .eq('id', item.product.id);
    }

    // 6. Clear Cart
    await supabase.from('cart_items').delete().eq('account_id', user.id);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      totalPrice,
      paymentMethod,
      message: 'Đặt hàng thành công!',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
