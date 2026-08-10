'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useRouter as useAppRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useAppRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
        body: JSON.stringify({ username, password }),
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

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center font-black text-2xl mb-3 shadow-lg shadow-amber-500/20">
              👟
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Đăng Nhập Tài Khoản</h2>
            <p className="text-sm text-neutral-400 mt-1">Chào mừng bạn quay lại Sneaker Vault 2026</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium text-center">
              {error}
            </div>
          )}

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
                  placeholder="Nhập tên đăng nhập (ví dụ: admin, customer1)"
                  className="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
                <User className="w-5 h-5 text-neutral-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu của bạn (mặc định: 123456)"
                  className="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
                <Lock className="w-5 h-5 text-neutral-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all shadow-lg shadow-amber-500/20 text-base flex items-center justify-center gap-2"
            >
              {loading ? 'Đang xác thực...' : 'Đăng Nhập Ngay'} <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-6 p-4 rounded-xl bg-neutral-800/60 border border-neutral-750 text-xs text-neutral-400 space-y-1">
            <p className="font-bold text-amber-400 mb-1">💡 Tài khoản thử nghiệm nhanh (Mật khẩu: 123456):</p>
            <p>• Admin: <code className="text-white">admin</code></p>
            <p>• Chủ cửa hàng: <code className="text-white">owner1</code></p>
            <p>• Giao hàng (Shipper): <code className="text-white">shipper1</code></p>
            <p>• Quản lý kho: <code className="text-white">warehouse1</code></p>
            <p>• Khách hàng: <code className="text-white">customer1</code></p>
          </div>

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
