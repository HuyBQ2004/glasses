'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { User, Lock, Mail, Phone, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullname: '',
    email: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [activationLink, setActivationLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setActivationLink('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        if (data.requireActivation) {
          setSuccessMsg(data.message || 'Đăng ký thành công! Vui lòng kiểm tra hộp thư Email để nhấp vào liên kết kích hoạt trước khi đăng nhập.');
          if (data.activationUrl) {
            setActivationLink(data.activationUrl);
          }
        } else {
          window.dispatchEvent(new Event('cartUpdated'));
          router.push('/');
          router.refresh();
        }
      } else {
        setError(data.error || 'Đăng ký thất bại');
      }
    } catch (err: any) {
      setError('Đã xảy ra lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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
      setError('Đã xảy ra lỗi khi đăng ký bằng Google');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-lg bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-white tracking-tight">Đăng Ký Tài Khoản Mới</h2>
            <p className="text-sm text-neutral-400 mt-1">Trở thành hội viên GLASSVAULT Luxury Eyewear</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium text-center">
              {error}
            </div>
          )}

          {successMsg ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center space-y-4 my-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Đăng Ký Thành Công! ✉️</h3>
              <p className="text-sm text-neutral-300 leading-relaxed">{successMsg}</p>
              
              {activationLink && (
                <div className="pt-2">
                  <a
                    href={activationLink}
                    className="inline-block px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-sm shadow-lg mb-3"
                  >
                    👉 Kích Hoạt Tài Khoản Ngay (Bấm Vào Đây)
                  </a>
                </div>
              )}

              <div className="pt-1 border-t border-neutral-800/80 mt-3">
                <Link
                  href="/login"
                  className="inline-block px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-md mt-2"
                >
                  Đi Đến Trang Đăng Nhập
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Google Signup Button */}
              <button
                type="button"
                onClick={handleGoogleSignup}
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
                Đăng Ký Nhanh Bằng Google
              </button>

              <div className="relative flex py-2 items-center mb-6">
                <div className="flex-grow border-t border-neutral-800"></div>
                <span className="flex-shrink mx-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Hoặc Đăng Ký Thủ Công</span>
                <div className="flex-grow border-t border-neutral-800"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                    Tên đăng nhập *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="username"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Nhập tên đăng nhập duy nhất"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:border-amber-500 focus:outline-none"
                    />
                    <User className="w-5 h-5 text-neutral-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                    Mật khẩu *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Mật khẩu của bạn"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:border-amber-500 focus:outline-none"
                    />
                    <Lock className="w-5 h-5 text-neutral-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                    Họ và Tên
                  </label>
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl py-3 px-4 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                      Email Kích Hoạt *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl py-3 px-4 text-sm text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0901234567"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl py-3 px-4 text-sm text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                    Địa chỉ giao hàng
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl py-3 px-4 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all shadow-lg shadow-amber-500/20 text-base flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản & Gửi Email Kích Hoạt'} <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-neutral-400 mt-6">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-amber-400 font-bold hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
