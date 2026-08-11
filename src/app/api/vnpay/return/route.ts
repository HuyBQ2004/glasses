import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId') || searchParams.get('vnp_TxnRef');
    const responseCode = searchParams.get('vnp_ResponseCode');

    if (responseCode === '00' && orderId) {
      await supabase
        .from('orders')
        .update({ payment_status: 'Paid' })
        .eq('id', orderId);
      return NextResponse.redirect(new URL(`/orders?status=success&orderId=${orderId}`, req.url));
    } else {
      return NextResponse.redirect(new URL(`/orders?status=failed&orderId=${orderId}`, req.url));
    }
  } catch {
    return NextResponse.redirect(new URL('/orders?status=error', req.url));
  }
}
