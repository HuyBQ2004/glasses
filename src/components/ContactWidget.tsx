'use client';

import { useState } from 'react';
import { MessageCircle, Phone, X } from 'lucide-react';

export default function ContactWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-5 z-50 flex flex-col items-end gap-2.5">

      {/* Expanded Quick Contact Buttons */}
      {isOpen && (
        <div className="flex flex-col gap-2.5 mb-1 animate-in fade-in slide-in-from-bottom-3 duration-200">
          
          {/* Zalo Chat Button */}
          <a
            href="https://zalo.me/0901234567"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg hover:scale-105 transition-all border border-blue-400/30"
          >
            <div className="w-5 h-5 bg-white text-blue-600 rounded-full flex items-center justify-center font-black text-[10px] shadow-sm">
              Z
            </div>
            <span>Chat Zalo</span>
          </a>

          {/* Facebook Messenger Button */}
          <a
            href="https://m.me/glassvault.official"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-lg hover:scale-105 transition-all border border-indigo-400/30"
          >
            <MessageCircle className="w-4 h-4 fill-white text-transparent" />
            <span>Chat Messenger</span>
          </a>

          {/* Direct Hotline Call */}
          <a
            href="tel:0901234567"
            className="flex items-center gap-2.5 px-3 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg hover:scale-105 transition-all border border-emerald-400/30"
          >
            <Phone className="w-3.5 h-3.5 fill-white" />
            <span>090.123.4567</span>
          </a>

        </div>
      )}

      {/* Small Compact Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-2xl hover:scale-110 transition-all border border-white/20 flex items-center justify-center group"
        title="Liên hệ Hotline & Chat Zalo"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Phone className="w-5 h-5 animate-pulse" />}
      </button>

    </div>
  );
}
