'use client';

import { useState, useEffect } from 'react';
import CloudflareTurnstile from './CloudflareTurnstile';
import { ShieldCheck, Cloud } from 'lucide-react';

export default function GlobalCloudflareSecurity() {
  const [verified, setVerified] = useState<boolean>(false);
  const [domainName, setDomainName] = useState<string>('glassvault.store');
  const [rayId, setRayId] = useState<string>('');
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setDomainName(window.location.hostname || 'glassvault.store');
      const isVerified = sessionStorage.getItem('cf_verified') === 'true';
      if (isVerified) {
        setVerified(true);
      }
      
      // Random Ray ID generation matching Cloudflare style
      const randomRay = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 8);
      setRayId(randomRay);
    }
  }, []);

  const handleVerify = (token: string) => {
    if (token) {
      setTimeout(() => {
        setVerified(true);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('cf_verified', 'true');
        }
      }, 500);
    }
  };

  if (!mounted) return null;

  if (verified) {
    return null; // Smoothly unlocked, render normal website
  }

  return (
    <div className="fixed inset-0 z-[99999] bg-neutral-950 text-white flex flex-col justify-between p-6 sm:p-12 font-sans select-none animate-in fade-in duration-300">
      {/* Top Margin */}
      <div />

      {/* Main Cloudflare Challenge Content (Matches Cloudflare Security Verification Screen) */}
      <div className="max-w-xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
            {domainName}
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-200">
            Performing security verification
          </h2>
        </div>

        <p className="text-sm text-neutral-400 leading-relaxed">
          This website uses a security service to protect against malicious bots and DDoS attacks. This page is displayed while the website verifies you are not a bot.
        </p>

        {/* Cloudflare Turnstile Verification Widget */}
        <div className="py-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-2xl flex flex-col items-center justify-center min-h-[140px]">
            <CloudflareTurnstile onVerify={handleVerify} />
          </div>
        </div>

        <p className="text-xs text-neutral-500">
          Trang web đang tự động kiểm tra trình duyệt của bạn trước khi truy cập hệ thống GLASSVAULT...
        </p>
      </div>

      {/* Bottom Footer (Ray ID & Cloudflare Attribution) */}
      <div className="border-t border-neutral-800/80 pt-6 text-center text-xs text-neutral-500 space-y-1 font-mono">
        <p>Ray ID: <span className="text-neutral-400 font-bold">{rayId}</span></p>
        <p className="font-sans flex items-center justify-center gap-1">
          Performance and Security by <span className="text-amber-500 font-bold flex items-center gap-1"><Cloud className="w-3.5 h-3.5 fill-amber-500" /> Cloudflare</span>
        </p>
      </div>
    </div>
  );
}
