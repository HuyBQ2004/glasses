'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Mail, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setResetUrl('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(data.message);
        if (data.resetUrl) {
          setResetUrl(data.resetUrl);
        }
      } else {
        setError(data.error || 'Gửi yêu cầu thất bại');
      }
    } catch (err: any) {
      setError('Đã xảy ra lỗi hệ thống khi kết nối');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/20">
              🔑
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Quên Mật Khẩu?</h2>
            <p className="text-sm text-neutral-400">
              Nhập địa chỉ Email đăng ký tài khoản của bạn để nhận liên kết đặt lại mật khẩu mới.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium text-center">
              {error}
            </div>
          )}

          {successMsg ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center space-y-4 my-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Đã Gửi Email Khôi Phục! ✉️</h3>
              <p className="text-sm text-neutral-300 leading-relaxed">{successMsg}</p>

              {resetUrl && (
                <div className="pt-2">
                  <a
                    href={resetUrl}
                    className="inline-block px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-sm shadow-lg mb-2"
                  >
                    👉 Đặt Lại Mật Khẩu Ngay (Liên Kết Trực Tiếp)
                  </a>
                </div>
              )}

              <div className="pt-2 border-t border-neutral-800/80 mt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-amber-400 font-bold text-sm hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại trang Đăng nhập
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Email Đăng Ký Tài Khoản *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                  <Mail className="w-5 h-5 text-neutral-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all shadow-lg shadow-amber-500/20 text-base flex items-center justify-center gap-2"
              >
                {loading ? 'Đang gửi Email...' : 'Gửi Email Lấy Lại Mật Khẩu'} <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {!successMsg && (
            <div className="text-center pt-2">
              <Link href="/login" className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-amber-400 font-medium">
                <ArrowLeft className="w-3.5 h-3.5" /> Nhớ lại mật khẩu? Quay lại đăng nhập
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
