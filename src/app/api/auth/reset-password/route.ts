import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { token, email, password } = await req.json();

    if (!token || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Thông tin liên kết khôi phục không đầy đủ hoặc thiếu mật khẩu mới' },
        { status: 400 }
      );
    }

    // Password Complexity Validation (Min 8 chars, uppercase, lowercase, number, special char)
    const isMinLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!isMinLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return NextResponse.json(
        {
          success: false,
          error: 'Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ in hoa (A-Z), chữ thường (a-z), chữ số (0-9) và ký tự đặc biệt (!@#$%...).',
        },
        { status: 400 }
      );
    }

    // Find account by token and email
    const targetEmail = email.trim().toLowerCase();
    const { data: user, error: userError } = await supabase
      .from('accounts')
      .select('id, username, token')
      .eq('email', targetEmail)
      .eq('token', token)
      .maybeSingle();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Liên kết khôi phục mật khẩu không hợp lệ hoặc đã hết hạn.' },
        { status: 400 }
      );
    }

    // Hash new password & clear token
    const newHashedPassword = hashPassword(password);
    const { error: updateError } = await supabase
      .from('accounts')
      .update({
        password: newHashedPassword,
        token: null, // Clear reset token
      })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
