'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, X, Send, RefreshCw, ShoppingBag, Eye, ShieldCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface ProductCard {
  id: string | number;
  name: string;
  title?: string;
  price: number;
  image?: string;
  manufacturer?: string;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  products?: ProductCard[];
  timestamp: string;
}

const QUICK_SUGGESTIONS = [
  '👓 Mặt tròn chọn gọng kính nào đẹp?',
  '💻 Kính chống ánh sáng xanh loại nào tốt?',
  '☀️ Top kính râm chống UV400 bán chạy',
  '💎 Gọng Titanium siêu nhẹ giá bao nhiêu?',
];

export default function GeminiAssistantWidget() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setMessages([
      {
        id: 'welcome-1',
        role: 'model',
        content:
          'Dạ em chào anh/chị! 👓 Em là **Chuyên gia AI Tư vấn Kính Mắt của GlassVault**. Em có thể tư vấn chọn gọng kính theo khuôn mặt, gợi ý kính râm, tròng kính chống ánh sáng xanh & tra cứu sản phẩm trực tiếp từ kho hàng GlassVault.\n\nAnh/chị đang cần chọn mẫu kính nào ạ?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!mounted) return null;


  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsgId = Date.now().toString();
    const newUserMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      // Chuẩn bị history cho API
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome-1')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: data.answer,
          products: data.products || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: `⚠️ ${data.error || 'Dạ hiện hệ thống AI đang bận. Anh/chị vui lòng thử lại sau giây lát nhé!'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (error) {
      console.error('Error fetching Gemini AI:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: '⚠️ Lỗi kết nối mạng. Vui lòng kiểm tra lại đường truyền internet.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMarkdown = (text: string) => {
    // Basic Markdown formatting helper
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-800 text-amber-400 px-1 py-0.5 rounded text-xs">$1</code>');

    return formatted;
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-1',
        role: 'model',
        content:
          'Dạ em chào anh/chị! 👓 Em là **Chuyên gia AI Tư vấn Kính Mắt của GlassVault**. Em có thể tư vấn chọn gọng kính theo khuôn mặt, gợi ý kính râm, tròng kính chống ánh sáng xanh & tra cứu sản phẩm trực tiếp từ kho hàng GlassVault.\n\nAnh/chị đang cần chọn mẫu kính nào ạ?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end">

      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 text-white font-bold text-sm shadow-2xl hover:scale-105 transition-all duration-300 border border-white/20 hover:shadow-indigo-500/25"
          title="Trợ lý AI Tư vấn Kính Mắt GlassVault"
        >
          <div className="relative">
            <Bot className="w-5 h-5 animate-bounce" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <span className="hidden sm:inline-block font-semibold tracking-wide">Tư vấn Kính AI</span>
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        </button>
      )}

      {/* Main Chat Modal Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-4 py-3.5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg border border-amber-400/30">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm tracking-wide">GlassVault AI Assistant</h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-mono flex items-center gap-1 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    RAG Engine
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-indigo-400" /> Chuyên gia Kính mắt 24/7
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
                title="Làm mới cuộc trò chuyện"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
                title="Đóng chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 px-1">
                  {msg.role === 'model' ? (
                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> GlassVault AI
                    </span>
                  ) : (
                    <span>Bạn</span>
                  )}
                  <span>• {msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-tr-none shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  <div
                    className="space-y-1 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                  />
                </div>

                {/* Product Recommendation Cards Carousel / Grid */}
                {msg.role === 'model' && msg.products && msg.products.length > 0 && (
                  <div className="w-full mt-2 space-y-2">
                    <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 pl-1">
                      <ShoppingBag className="w-3.5 h-3.5" /> Sản phẩm gợi ý phù hợp:
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.products.map((prod) => (
                        <div
                          key={prod.id}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all group"
                        >
                          {prod.image ? (
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-12 h-12 rounded-lg object-cover bg-slate-950 border border-slate-800"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500">
                              <Eye className="w-5 h-5" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-slate-100 truncate group-hover:text-amber-400 transition-colors">
                              {prod.name}
                            </h4>
                            <p className="text-[11px] font-bold text-emerald-400">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                prod.price
                              )}
                            </p>
                            {prod.manufacturer && (
                              <span className="text-[10px] text-slate-400 block">{prod.manufacturer}</span>
                            )}
                          </div>

                          <Link
                            href={`/products?search=${encodeURIComponent(prod.name)}`}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold text-[11px] transition-all flex items-center gap-1"
                          >
                            Xem <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Loading Typing Indicator */}
            {isLoading && (
              <div className="flex flex-col items-start space-y-1.5">
                <div className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 pl-1">
                  <Sparkles className="w-3 h-3 animate-spin" /> RAG AI đang phân tích kho hàng...
                </div>
                <div className="bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-3 py-2 bg-slate-900/60 border-t border-slate-800/60 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
            {QUICK_SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(sug)}
                disabled={isLoading}
                className="whitespace-nowrap text-[11px] px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 border border-slate-700/60 transition-all hover:scale-105 disabled:opacity-50"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Hỏi AI về chọn dáng kính, kính râm, gọng kính..."
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all disabled:opacity-50"
            />

            <button
              onClick={() => handleSend()}
              disabled={isLoading || !inputMessage.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 text-white font-bold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              title="Gửi tin nhắn"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
