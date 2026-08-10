import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { signToken } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const username = searchParams.get('username');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Mã xác thực không hợp lệ' }, { status: 400 });
    }

    let query = supabase.from('accounts').select('*').eq('token', token);
    if (username) {
      query = query.eq('username', username);
    }

    const { data: user, error } = await query.maybeSingle();

    if (error || !user) {
      return NextResponse.json({ success: false, error: 'Liên kết kích hoạt không tồn tại hoặc đã hết hạn' }, { status: 404 });
    }

    // Update user active status to true
    const { error: updateErr } = await supabase
      .from('accounts')
      .update({ active: true, token: null })
      .eq('id', user.id);

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
    }

    // Generate JWT session token
    const jwtToken = signToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Kích hoạt tài khoản thành công! Bạn có thể bắt đầu sử dụng GLASSVAULT.',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullname: user.fullname,
      },
    });

    response.cookies.set('token', jwtToken, {
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
