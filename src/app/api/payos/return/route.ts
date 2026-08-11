import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (orderId) {
      // Update order status to Paid upon successful PayOS payment
      await supabase
        .from('orders')
        .update({ payment_status: 'Paid' })
        .eq('id', orderId);

      return NextResponse.redirect(new URL(`/orders?status=success&orderId=${orderId}`, req.url));
    }

    return NextResponse.redirect(new URL('/orders?status=success', req.url));
  } catch {
    return NextResponse.redirect(new URL('/orders?status=error', req.url));
  }
}
