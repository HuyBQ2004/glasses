import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { signToken, hashPassword } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const requestUrl = new URL(req.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
      const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && sessionData?.user) {
        const user = sessionData.user;
        const email = user.email || '';
        const fullname = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0];
        const username = email ? email.split('@')[0] : `google_${user.id.slice(0, 8)}`;

        // Check if account exists in custom accounts table
        let { data: account } = await supabaseAdmin.from('accounts').select('*').eq('email', email).maybeSingle();

        if (!account) {
          const randomSecret = `GOOGLE_OAUTH_${Date.now()}_${Math.random().toString(36).substring(2)}`;
          const hashedPassword = hashPassword(randomSecret);

          // Create new customer account from Google OAuth
          const { data: newAccount } = await supabaseAdmin.from('accounts').insert({
            username,
            email,
            password: hashedPassword,
            fullname,
            role: 'customer',
            active: true,
          }).select().single();
          account = newAccount;
        }

        if (account) {
          const token = signToken({
            userId: account.id,
            username: account.username,
            role: account.role,
          });

          const response = NextResponse.redirect(new URL('/', req.url));
          response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60,
          });
          return response;
        }
      }
    }

    return NextResponse.redirect(new URL('/login?error=google_failed', req.url));
  } catch {
    return NextResponse.redirect(new URL('/login?error=google_error', req.url));
  }
}
