'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const username = searchParams.get('username');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setSuccess(false);
      setMessage('Không tìm thấy mã xác thực token kích hoạt.');
      return;
    }

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}&username=${encodeURIComponent(username || '')}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSuccess(true);
          setMessage(data.message || 'Tài khoản của bạn đã được kích hoạt thành công!');
          window.dispatchEvent(new Event('cartUpdated'));
        } else {
          setSuccess(false);
          setMessage(data.error || 'Xác thực kích hoạt không thành công.');
        }
      })
      .catch(() => {
        setSuccess(false);
        setMessage('Đã xảy ra lỗi kết nối hệ thống.');
      })
      .finally(() => setLoading(false));
  }, [token, username]);

  return (
    <main className="flex-1 flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl text-center">
        {loading ? (
          <div className="space-y-4 py-8">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-white">Đang Kích Hoạt Tài Khoản...</h2>
            <p className="text-sm text-neutral-400">Vui lòng chờ trong giây lát...</p>
          </div>
        ) : success ? (
          <div className="space-y-6 py-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-white">Kích Hoạt Thành Công! 🎉</h2>
            <p className="text-sm text-neutral-300">{message}</p>
            <div className="pt-2">
              <Link
                href="/"
                className="w-full py-3.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all shadow-lg text-sm inline-flex items-center justify-center gap-2"
              >
                Về Trang Chủ Mua Sắm <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center mx-auto text-rose-400">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-white">Kích Hoạt Thất Bại</h2>
            <p className="text-sm text-rose-400">{message}</p>
            <div className="pt-2">
              <Link
                href="/login"
                className="w-full py-3.5 rounded-xl font-bold bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700 transition-all text-sm inline-flex items-center justify-center gap-2"
              >
                Quay Lại Đăng Nhập <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      <Header />
      <Suspense fallback={<div className="text-center py-20 text-neutral-500">Đang tải...</div>}>
        <VerifyEmailContent />
      </Suspense>
      <Footer />
    </div>
  );
}
