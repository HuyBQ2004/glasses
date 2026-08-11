import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { id } = await params;

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, shipping:shippings(*), account:accounts(id, fullname, email, phone, username)')
      .eq('id', id)
      .single();

    if (error || !order) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    // Check ownership if customer
    const orderAccountId = order.account?.id || order.account_id;
    if (user.role === 'customer' && orderAccountId !== user.id) {
      return NextResponse.json({ success: false, error: 'Không có quyền truy cập đơn hàng này' }, { status: 403 });
    }

    const { data: items } = await supabase
      .from('order_details')
      .select('*')
      .eq('order_id', id);

    const formattedOrder = {
      ...order,
      _id: order.id,
      totalPrice: order.total_price ?? order.totalPrice,
      shipping_id: order.shipping ? { ...order.shipping, _id: order.shipping.id } : order.shipping_id,
      account_id: order.account ? { ...order.account, _id: order.account.id } : order.account_id,
    };

    const formattedItems = (items || []).map((it: Record<string, unknown>) => ({
      ...it,
      _id: it.id,
      productName: it.product_name ?? it.productName,
      productImage: it.product_image ?? it.productImage,
      productPrice: it.product_price ?? it.productPrice,
    }));

    return NextResponse.json({ success: true, order: formattedOrder, items: formattedItems });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
