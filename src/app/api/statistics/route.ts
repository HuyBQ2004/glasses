import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
      return NextResponse.json({ success: false, error: 'Không có quyền truy cập thống kê' }, { status: 403 });
    }

    const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { count: totalUsers } = await supabase.from('accounts').select('*', { count: 'exact', head: true });
    const { count: totalFeedbacks } = await supabase.from('feedbacks').select('*', { count: 'exact', head: true });

    // Total Revenue (Calculated ONLY for successful/paid/completed orders)
    const { data: orders } = await supabase
      .from('orders')
      .select('total_price, payment_status, status');

    const totalRevenue = (orders || []).reduce((sum, order) => {
      const pStatus = (order.payment_status || '').toLowerCase();
      const oStatus = (order.status || '').toLowerCase();
      const isSuccess = pStatus === 'paid' || oStatus === 'completed' || oStatus === 'delivered' || oStatus === 'da_giao' || pStatus === 'da_thanh_toan';
      return isSuccess ? sum + (Number(order.total_price) || 0) : sum;
    }, 0);

    // Recent orders
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('*, account:accounts(id, fullname, email, username), shipping:shippings(*)')
      .order('create_date', { ascending: false })
      .limit(5);

    const formattedRecentOrders = (recentOrders || []).map((ord: any) => ({
      ...ord,
      _id: ord.id,
      totalPrice: ord.total_price ?? ord.totalPrice,
      account_id: ord.account ? { ...ord.account, _id: ord.account.id } : ord.account_id,
      shipping_id: ord.shipping ? { ...ord.shipping, _id: ord.shipping.id } : ord.shipping_id,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders: totalOrders || 0,
        totalProducts: totalProducts || 0,
        totalUsers: totalUsers || 0,
        totalFeedbacks: totalFeedbacks || 0,
        totalRevenue,
      },
      recentOrders: formattedRecentOrders,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
