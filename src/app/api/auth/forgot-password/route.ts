import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendResetPasswordEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập địa chỉ Email đăng ký tài khoản' },
        { status: 400 }
      );
    }

    const targetEmail = email.trim().toLowerCase();

    // Check if account exists with this email
    const { data: user } = await supabase
      .from('accounts')
      .select('id, username, email, fullname')
      .eq('email', targetEmail)
      .maybeSingle();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy tài khoản nào liên kết với Email này trong hệ thống' },
        { status: 404 }
      );
    }

    // Determine Base App URL for Reset Link
    let appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl || appUrl.includes('localhost')) {
      const origin = new URL(req.url).origin;
      if (origin && !origin.includes('localhost')) appUrl = origin;
    }
    appUrl = (appUrl || 'http://localhost:3000').replace(/\/$/, '');

    // Generate secure 64-char hex reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Save token to account in Supabase DB
    const { error: updateError } = await supabase
      .from('accounts')
      .update({ token: resetToken })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    const hasSmtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

    // Send Reset Email
    await sendResetPasswordEmail({
      to: user.email,
      username: user.fullname || user.username,
      token: resetToken,
      appUrl,
    });

    const resetUrl = `${appUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    return NextResponse.json({
      success: true,
      message: hasSmtp
        ? 'Đã gửi liên kết khôi phục mật khẩu vào Email của bạn. Vui lòng kiểm tra hộp thư!'
        : 'Đã tạo liên kết khôi phục mật khẩu. Vui lòng truy cập liên kết bên dưới để tạo mật khẩu mới.',
      resetUrl: hasSmtp ? null : resetUrl,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
