import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { username, password, fullname, email, phone, address } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Tên đăng nhập và mật khẩu là bắt buộc' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('accounts')
      .select('id')
      .eq('username', username)
      .single();

    if (existing) {
      return NextResponse.json({ success: false, error: 'Tên đăng nhập đã tồn tại' }, { status: 400 });
    }

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
        active: true,
      })
      .select()
      .single();

    if (error || !user) {
      return NextResponse.json({ success: false, error: error?.message || 'Không thể tạo tài khoản' }, { status: 500 });
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
