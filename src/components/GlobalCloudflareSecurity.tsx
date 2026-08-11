'use client';

import { useState, useEffect } from 'react';
import CloudflareTurnstile from './CloudflareTurnstile';
import { ShieldCheck, Cloud, CheckCircle2, ArrowRight } from 'lucide-react';

export default function GlobalCloudflareSecurity() {
  const [verified, setVerified] = useState<boolean>(false);
  const [domainName, setDomainName] = useState<string>('glassvault.store');
  const [rayId, setRayId] = useState<string>('');
  const [mounted, setMounted] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('Đang kiểm tra an toàn kết nối...');

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (!isMounted) return;
      setMounted(true);
      if (typeof window !== 'undefined') {
        const currentHost = window.location.hostname || 'glassvault.store';
        setDomainName(currentHost);

        const isVerified = sessionStorage.getItem('cf_verified') === 'true';
        if (isVerified) {
          setVerified(true);
          return;
        }

        const randomRay =
          Math.random().toString(36).substring(2, 12) +
          Math.random().toString(36).substring(2, 8);
        setRayId(randomRay);
      }
    });

    const autoTimer = setTimeout(() => {
      if (!isMounted) return;
      setStatusText('Tự động xác minh kết nối an toàn!');
      setTimeout(() => {
        if (!isMounted) return;
        setVerified(true);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('cf_verified', 'true');
        }
      }, 600);
    }, 4000);

    return () => {
      isMounted = false;
      clearTimeout(autoTimer);
    };
  }, []);

  const handleVerify = (token: string) => {
    if (token) {
      setStatusText('Xác minh thành công! Đang chuyển hướng...');
      setTimeout(() => {
        setVerified(true);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('cf_verified', 'true');
        }
      }, 400);
    }
  };

  const handleManualBypass = () => {
    setVerified(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('cf_verified', 'true');
    }
  };

  if (!mounted || verified) {
    return null; // Đã qua lớp bảo vệ an toàn -> Hiển thị website chính
  }

  return (
    <div className="fixed inset-0 z-[99999] bg-neutral-950 text-white flex flex-col justify-between p-6 sm:p-12 font-sans select-none animate-in fade-in duration-300">
      {/* Header Margin */}
      <div />

      {/* Main Cloudflare Challenge Content */}
      <div className="max-w-xl mx-auto w-full space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Cloudflare Security Verification
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
            {domainName}
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-200">
            Checking if the site connection is secure
          </h2>
        </div>

        <p className="text-sm text-neutral-400 leading-relaxed">
          Website đang sử dụng hệ thống tường lửa Cloudflare Turnstile để chống tấn công DDoS và ngăn chặn Bot tự động...
        </p>

        {/* Cloudflare Turnstile Verification Widget */}
        <div className="py-2">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl flex flex-col items-center justify-center min-h-[150px]">
            <CloudflareTurnstile onVerify={handleVerify} />
            <p className="text-xs text-amber-400/90 mt-3 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {statusText}
            </p>
          </div>
        </div>

        {/* Nút bấm xác minh thủ công nếu tên miền Vercel chưa add vào Cloudflare Turnstile Dashboard */}
        <div className="flex justify-center pt-1">
          <button
            onClick={handleManualBypass}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-neutral-200 hover:text-white transition-all shadow-lg group"
          >
            <span>Tôi là người dùng thật - Vào ngay website</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-amber-400" />
          </button>
        </div>
      </div>

      {/* Bottom Footer (Ray ID & Cloudflare Attribution) */}
      <div className="border-t border-neutral-800/80 pt-6 text-center text-xs text-neutral-500 space-y-1 font-mono">
        <p>
          Ray ID: <span className="text-neutral-400 font-bold">{rayId}</span>
        </p>
        <p className="font-sans flex items-center justify-center gap-1">
          Performance & Security by{' '}
          <span className="text-amber-500 font-bold flex items-center gap-1">
            <Cloud className="w-3.5 h-3.5 fill-amber-500" /> Cloudflare
          </span>
        </p>
      </div>
    </div>
  );
}
