'use client';

import { useState, useEffect } from 'react';
import CloudflareTurnstile from './CloudflareTurnstile';
import { ShieldCheck, Lock } from 'lucide-react';

export default function GlobalCloudflareSecurity() {
  const [verified, setVerified] = useState<boolean>(false);
  const [showBadge, setShowBadge] = useState<boolean>(true);

  useEffect(() => {
    // Check if session has already been verified
    const isVerified = sessionStorage.getItem('cf_verified') === 'true';
    if (isVerified) {
      setVerified(true);
    }
  }, []);

  const handleVerify = (token: string) => {
    if (token) {
      setVerified(true);
      sessionStorage.setItem('cf_verified', 'true');
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-40">
      {!verified ? (
        <div className="bg-neutral-900/95 border border-amber-500/40 backdrop-blur-md rounded-2xl p-3 shadow-2xl space-y-2 max-w-xs animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Xác Thức An Ninh Cloudflare Anti-DDoS</span>
          </div>
          <p className="text-[11px] text-neutral-400 leading-tight">
            Vui lòng xác minh để truy cập toàn bộ hệ thống GLASSVAULT an toàn.
          </p>
          <CloudflareTurnstile onVerify={handleVerify} />
        </div>
      ) : (
        showBadge && (
          <div className="bg-neutral-900/80 border border-emerald-500/30 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg flex items-center gap-2 text-xs text-emerald-400 font-semibold animate-in fade-in duration-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Cloudflare Protected (Anti-DDoS Active)</span>
            <button
              onClick={() => setShowBadge(false)}
              className="text-neutral-500 hover:text-neutral-300 ml-1 text-xs"
              title="Ẩn thông báo"
            >
              ✕
            </button>
          </div>
        )
      )}
    </div>
  );
}
