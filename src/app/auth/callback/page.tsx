'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const syncUserAndRedirect = async (user: any) => {
      try {
        const email = user.email;
        const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0];

        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name }),
        });
        const data = await res.json();

        if (data.success) {
          window.dispatchEvent(new Event('cartUpdated'));
          window.location.href = '/';
        } else if (mounted) {
          setError(data.error || 'Không thể đồng bộ tài khoản Google');
        }
      } catch (err: any) {
        if (mounted) setError(err.message || 'Lỗi đồng bộ dữ liệu');
      }
    };

    const handleAuthCallback = async () => {
      try {
        // 1. Try fetching current session directly
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();

        if (session?.user) {
          await syncUserAndRedirect(session.user);
          return;
        }

        // 2. Listen for auth state change if session is being processed asynchronously
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          if (currentSession?.user) {
            await syncUserAndRedirect(currentSession.user);
          }
        });

        // 3. Fallback timeout if no session is returned
        setTimeout(() => {
          if (mounted && !session?.user) {
            setError('Không nhận được phiên đăng nhập từ Google. Vui lòng thử lại.');
          }
        }, 6000);

        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (err: any) {
        if (mounted) setError(err.message || 'Lỗi xác thực đăng nhập Google');
      }
    };

    handleAuthCallback();

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center font-sans p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
        {error ? (
          <>
            <h2 className="text-xl font-bold text-rose-400">Đăng Nhập Google Thất Bại</h2>
            <p className="text-sm text-neutral-400">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 px-6 py-2.5 bg-amber-500 text-neutral-950 font-bold rounded-xl text-sm hover:bg-amber-400 transition-colors"
            >
              Quay Lại Đăng Nhập
            </button>
          </>
        ) : (
          <>
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-white">Đang Hoàn Tất Đăng Nhập Google...</h2>
            <p className="text-xs text-neutral-400">Hệ thống đang tự động chuyển hướng bạn về Trang Chủ.</p>
          </>
        )}
      </div>
    </div>
  );
}
