import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { orderId, amount } = await req.json();

    const tmnCode = process.env.VNP_TMNCODE || 'DEMO1234';
    const secretKey = process.env.VNP_HASHSECRET || 'SECRETKEY1234567890';
    let vnpUrl = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    let appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl || appUrl.includes('localhost')) {
      const origin = new URL(req.url).origin;
      if (origin && !origin.includes('localhost')) {
        appUrl = origin;
      }
    }
    appUrl = (appUrl || 'http://localhost:3000').replace(/\/$/, '');

    const returnUrl = process.env.VNP_RETURNURL || `${appUrl}/api/vnpay/return`;

    const date = new Date();
    const createDate = date.getFullYear().toString() +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      ('0' + date.getDate()).slice(-2) +
      ('0' + date.getHours()).slice(-2) +
      ('0' + date.getMinutes()).slice(-2) +
      ('0' + date.getSeconds()).slice(-2);

    const currCode = 'VND';
    let vnp_Params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: currCode,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan don hang #${orderId}`,
      vnp_OrderType: 'other',
      vnp_Amount: (amount * 100).toString(),
      vnp_ReturnUrl: `${returnUrl}?orderId=${orderId}`,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: createDate,
    };

    // Sort params
    const sortedKeys = Object.keys(vnp_Params).sort();
    const query = sortedKeys.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(vnp_Params[key])}`).join('&');

    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(query, 'utf-8')).digest('hex');
    vnpUrl += '?' + query + '&vnp_SecureHash=' + signed;

    return NextResponse.json({ success: true, paymentUrl: vnpUrl });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
