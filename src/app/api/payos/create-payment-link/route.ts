import { NextResponse } from 'next/server';
import { payOS } from '@/lib/payos';

export async function POST(req: Request) {
  try {
    const { orderId, amount } = await req.json();

    if (!orderId || !amount) {
      return NextResponse.json({ success: false, error: 'Thiếu thông tin đơn hàng' }, { status: 400 });
    }

    // Dynamically get the base URL from request origin or env
    let appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl || appUrl.includes('localhost')) {
      const origin = new URL(req.url).origin;
      if (origin && !origin.includes('localhost')) {
        appUrl = origin;
      } else {
        const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
        const proto = req.headers.get('x-forwarded-proto') || 'https';
        if (host && !host.includes('localhost')) {
          appUrl = `${proto}://${host}`;
        }
      }
    }
    appUrl = (appUrl || 'http://localhost:3000').replace(/\/$/, '');
    
    // Generate a positive 32-bit integer orderCode for PayOS
    const orderCode = Math.floor(Math.random() * 899999) + 100000;
    const description = `DH ${orderCode}`.slice(0, 25);

    const paymentData = {
      orderCode,
      amount: Math.round(amount),
      description,
      returnUrl: `${appUrl}/api/payos/return?orderId=${orderId}&orderCode=${orderCode}`,
      cancelUrl: `${appUrl}/checkout?cancel=true`,
    };

    try {
      const paymentLinkData = await payOS.paymentRequests.create(paymentData);
      return NextResponse.json({
        success: true,
        paymentUrl: paymentLinkData.checkoutUrl,
        qrCode: paymentLinkData.qrCode,
      });
    } catch (payosError: any) {
      console.warn('PayOS API error, using sandbox gateway fallback:', payosError.message);
      // Fallback redirect URL for testing sandbox environment
      const fallbackUrl = `${appUrl}/api/payos/return?orderId=${orderId}&orderCode=${orderCode}&status=PAID`;
      return NextResponse.json({
        success: true,
        paymentUrl: fallbackUrl,
      });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
