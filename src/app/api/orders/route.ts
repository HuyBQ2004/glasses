import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    let query = supabase
      .from('orders')
      .select('*, shipping:shippings(*), account:accounts(id, fullname, email, phone, username)')
      .order('create_date', { ascending: false });

    // Customer only sees their own orders
    if (user.role === 'customer') {
      query = query.eq('account_id', user.id);
    }

    const { data: orders, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Format fields for backward compatibility with UI expecting totalPrice & _id
    const formattedOrders = (orders || []).map((ord: Record<string, unknown>) => {
      const shp = ord.shipping as Record<string, unknown> | null;
      const acc = ord.account as Record<string, unknown> | null;
      return {
        ...ord,
        _id: ord.id,
        totalPrice: ord.total_price ?? ord.totalPrice,
        shipping_id: shp ? { ...shp, _id: shp.id } : ord.shipping_id,
        account_id: acc ? { ...acc, _id: acc.id } : ord.account_id,
      };
    });

    return NextResponse.json({ success: true, orders: formattedOrders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
