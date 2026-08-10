import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Vui lòng nhập tài khoản và mật khẩu' }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user || !comparePassword(password, user.password || '')) {
      return NextResponse.json({ success: false, error: 'Tên đăng nhập hoặc mật khẩu không chính xác' }, { status: 401 });
    }

    if (!user.active) {
      return NextResponse.json({ success: false, error: 'Tài khoản chưa được kích hoạt qua Email. Vui lòng kiểm tra email để nhấp vào liên kết kích hoạt.' }, { status: 403 });
    }

    const token = signToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
      },
      token,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
