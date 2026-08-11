'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter as useAppRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CloudflareTurnstile from '@/components/CloudflareTurnstile';
import { Lock, User, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useAppRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, turnstileToken }),
      });
      const data = await res.json();

      if (data.success) {
        window.dispatchEvent(new Event('cartUpdated'));
        if (data.user.role !== 'customer') {
          router.push('/dashboard');
        } else {
          router.push('/');
        }
        router.refresh();
      } else {
        setError(data.error || 'Đăng nhập thất bại');
      }
    } catch (err: any) {
      setError('Đã xảy ra lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        if (error.message.includes('provider is not enabled') || error.message.includes('validation_failed')) {
          setError('Tính năng Google Provider chưa được bật trên Supabase Dashboard. Bạn cần vào Supabase -> Authentication -> Providers -> Google và gạt bật Enabled.');
        } else {
          setError(error.message);
        }
      }
    } catch (err: any) {
      setError('Đã xảy ra lỗi khi đăng nhập bằng Google');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center font-black text-2xl mb-3 shadow-lg shadow-amber-500/20">
              👓
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Đăng Nhập Tài Khoản</h2>
            <p className="text-sm text-neutral-400 mt-1">Chào mừng quay lại GLASSVAULT Eyewear Boutique</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium text-center">
              {error}
            </div>
          )}

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 rounded-xl font-bold bg-neutral-800 hover:bg-neutral-750 text-white border border-neutral-700 transition-all text-sm flex items-center justify-center gap-3 mb-6 hover:shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Đăng Nhập Bằng Google
          </button>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-neutral-800"></div>
            <span className="flex-shrink mx-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Hoặc Đăng Nhập Tài Khoản</span>
            <div className="flex-grow border-t border-neutral-800"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                Tên đăng nhập
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  className="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
                <User className="w-5 h-5 text-neutral-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  Mật khẩu
                </label>
                <Link href="/forgot-password" className="text-xs text-amber-400 font-bold hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
                <Lock className="w-5 h-5 text-neutral-400 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Cloudflare Anti-Bot Turnstile Widget */}
            <CloudflareTurnstile onVerify={(token) => setTurnstileToken(token)} />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all shadow-lg shadow-amber-500/20 text-base flex items-center justify-center gap-2"
            >
              {loading ? 'Đang xác thực...' : 'Đăng Nhập Ngay'} <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <p className="text-center text-sm text-neutral-400 mt-6">
            Chưa có tài khoản?{' '}
            <Link href="/signup" className="text-amber-400 font-bold hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
