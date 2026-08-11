'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Lock, Eye, EyeOff, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Live Password Validation Criteria ("Nhập đến đâu check đến đấy")
  const pwdRules = [
    { label: 'Ít nhất 8 ký tự', valid: password.length >= 8 },
    { label: 'Có chữ in hoa (A-Z)', valid: /[A-Z]/.test(password) },
    { label: 'Có chữ in thường (a-z)', valid: /[a-z]/.test(password) },
    { label: 'Có chữ số (0-9)', valid: /[0-9]/.test(password) },
    { label: 'Có ký tự đặc biệt (!@#$%...)', valid: /[^A-Za-z0-9]/.test(password) },
  ];
  const isPasswordValid = pwdRules.every((r) => r.valid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!token || !email) {
      setError('Liên kết khôi phục không hợp lệ hoặc thiếu thông tin xác thực');
      return;
    }

    if (!isPasswordValid) {
      setError('Mật khẩu mới chưa đáp ứng đủ 5 yêu cầu an toàn bên dưới!');
      return;
    }

    if (password !== confirmPassword) {
      setError('Xác nhận mật khẩu mới không khớp!');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(data.message || 'Đặt lại mật khẩu thành công!');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.error || 'Đặt lại mật khẩu thất bại');
      }
    } catch {
      setError('Đã xảy ra lỗi hệ thống khi kết nối');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/20">
            🔒
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Tạo Mật Khẩu Mới</h2>
          <p className="text-sm text-neutral-400">
            Khôi phục mật khẩu cho tài khoản: <span className="text-amber-400 font-bold">{email}</span>
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
            <h3 className="text-lg font-bold text-white">Đổi Mật Khẩu Thành Công! 🎉</h3>
            <p className="text-sm text-neutral-300 leading-relaxed">{successMsg}</p>
            <p className="text-xs text-neutral-400">Tự động chuyển hướng về trang Đăng nhập sau 3 giây...</p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-block px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-md"
              >
                Đăng Nhập Ngay
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                Mật Khẩu Mới *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới an toàn..."
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl py-3 pl-11 pr-11 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
                <Lock className="w-5 h-5 text-neutral-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-neutral-400 hover:text-amber-400 transition-colors"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Real-time Password Checklist UI ("Nhập đến đâu check đến đấy") */}
              {password.length > 0 && (
                <div className="mt-2.5 p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    <span>Yêu cầu độ bảo mật mật khẩu:</span>
                    <span className={isPasswordValid ? 'text-emerald-400' : 'text-amber-400'}>
                      {isPasswordValid ? '✅ Đạt Yêu Cầu' : '⚠️ Chưa Đủ Độ An Toàn'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {pwdRules.map((rule, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-1.5 transition-colors ${
                          rule.valid ? 'text-emerald-400 font-bold' : 'text-neutral-500 font-normal'
                        }`}
                      >
                        {rule.valid ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-neutral-600 shrink-0" />
                        )}
                        <span>{rule.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                Xác Nhận Mật Khẩu Mới *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
                <Lock className="w-5 h-5 text-neutral-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all shadow-lg shadow-amber-500/20 text-base flex items-center justify-center gap-2 mt-4"
            >
              {loading ? 'Đang lưu mật khẩu...' : 'Lưu Mật Khẩu Mới'} <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      <Header />
      <Suspense fallback={<div className="text-center py-20 text-neutral-500">Đang tải...</div>}>
        <ResetPasswordContent />
      </Suspense>
      <Footer />
    </div>
  );
}
