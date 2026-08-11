import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const user = await getCurrentUser();

    if (code) {
      const upperCode = code.toUpperCase();
      const { data: voucher, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('code', upperCode)
        .maybeSingle();

      if (error || !voucher) {
        return NextResponse.json({ success: false, error: 'Mã giảm giá không tồn tại' }, { status: 404 });
      }

      // Check Expiration
      if (new Date(voucher.expiry_date) < new Date()) {
        return NextResponse.json({ success: false, error: 'Mã giảm giá này đã hết hạn' }, { status: 400 });
      }

      // Check First-Order Restriction for KINH20
      if (upperCode === 'KINH20' && user) {
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

      return NextResponse.json({ success: true, voucher: { ...voucher, _id: voucher.id } });
    }

    // Return only active & unexpired vouchers for list dropdown
    const now = new Date().toISOString();
    const { data: vouchers, error } = await supabase
      .from('vouchers')
      .select('*')
      .gte('expiry_date', now)
      .order('expiry_date', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const formattedVouchers = (vouchers || []).map((v: any) => ({
      ...v,
      _id: v.id,
    }));

    return NextResponse.json({ success: true, vouchers: formattedVouchers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
      return NextResponse.json({ success: false, error: 'Không có quyền tạo voucher' }, { status: 403 });
    }

    const { code, discount_percent, max_discount, min_order_value, expiry_date } = await req.json();

    const { data: stores } = await supabase.from('stores').select('*').limit(1);
    const store = stores && stores.length > 0 ? stores[0] : null;

    const { data: voucher, error } = await supabase
      .from('vouchers')
      .insert({
        code: code.toUpperCase(),
        discount_percent,
        max_discount,
        min_order_value,
        expiry_date: new Date(expiry_date).toISOString(),
        store_id: store?.id || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, voucher: { ...voucher, _id: voucher.id } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
