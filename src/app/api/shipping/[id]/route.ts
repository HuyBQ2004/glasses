import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'shipper' && user.role !== 'owner')) {
      return NextResponse.json({ success: false, error: 'Chỉ có Shipper hoặc Owner cửa hàng mới được quản lý vận chuyển' }, { status: 403 });
    }

    const { id } = await params;
    const { status } = await req.json();

    if (!['Pending', 'Shipping', 'Delivered', 'Cancelled'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Trạng thái không hợp lệ' }, { status: 400 });
    }

    const updateData: any = { status };
    if (status === 'Delivered') {
      updateData.shipped_date = new Date().toISOString();
    }

    const { data: updatedShipping, error } = await supabase
      .from('shippings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // If delivered and payment was COD, update payment_status to Paid
    if (status === 'Delivered') {
      await supabase
        .from('orders')
        .update({ payment_status: 'Paid' })
        .eq('shipping_id', id);
    }

    return NextResponse.json({ success: true, shipping: updatedShipping });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
