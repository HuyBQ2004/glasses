import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';
import { sendActivationEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { username, password, fullname, email, phone, address } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Tên đăng nhập và mật khẩu là bắt buộc' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ success: false, error: 'Địa chỉ Email là bắt buộc để kích hoạt tài khoản' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('accounts')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: false, error: 'Tên đăng nhập đã tồn tại' }, { status: 400 });
    }

    // Determine Base URL for Activation Link
    let appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl || appUrl.includes('localhost')) {
      const origin = new URL(req.url).origin;
      if (origin && !origin.includes('localhost')) appUrl = origin;
    }
    appUrl = (appUrl || 'http://localhost:3000').replace(/\/$/, '');

    const activationToken = crypto.randomBytes(24).toString('hex');
    const hashedPassword = hashPassword(password);

    const { data: user, error } = await supabase
      .from('accounts')
      .insert({
        username,
        password: hashedPassword,
        role: 'customer',
        fullname,
        email,
        phone,
        address,
        active: false, // Inactive until email verification
        token: activationToken, // Store token in DB
      })
      .select()
      .single();

    if (error || !user) {
      return NextResponse.json({ success: false, error: error?.message || 'Không thể tạo tài khoản' }, { status: 500 });
    }

    // Send Activation Email
    await sendActivationEmail({
      to: email,
      username: user.fullname || user.username,
      token: activationToken,
      appUrl,
    });

    return NextResponse.json({
      success: true,
      requireActivation: true,
      message: 'Đăng ký thành công! Vui lòng kiểm tra hộp thư email của bạn để nhấp vào liên kết kích hoạt tài khoản trước khi đăng nhập.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
