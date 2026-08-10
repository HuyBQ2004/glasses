import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { signToken, hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email là bắt buộc để đăng nhập bằng Google' }, { status: 400 });
    }

    const fullname = name || email.split('@')[0];

    // Check if account exists by email
    let { data: account } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (!account) {
      // Generate a unique username from email
      const baseUsername = email.split('@')[0] || `google_${Date.now()}`;
      let username = baseUsername;
      let counter = 1;

      while (true) {
        const { data: existUser } = await supabaseAdmin.from('accounts').select('id').eq('username', username).maybeSingle();
        if (!existUser) break;
        username = `${baseUsername}_${counter}`;
        counter++;
      }

      // Generate placeholder password for OAuth user to satisfy NOT NULL constraint
      const randomSecret = `GOOGLE_OAUTH_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const hashedPassword = hashPassword(randomSecret);

      // Create customer account for Google user in database
      const { data: newAcc, error: createErr } = await supabaseAdmin
        .from('accounts')
        .insert({
          username,
          email,
          password: hashedPassword,
          fullname,
          role: 'customer',
          active: true,
        })
        .select()
        .single();

      if (createErr || !newAcc) {
        return NextResponse.json({ success: false, error: createErr?.message || 'Không thể khởi tạo tài khoản Google' }, { status: 500 });
      }
      account = newAcc;
    }

    const token = signToken({
      userId: account.id,
      username: account.username,
      role: account.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: account.id,
        username: account.username,
        role: account.role,
        fullname: account.fullname,
        email: account.email,
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
