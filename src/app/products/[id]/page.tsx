'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShoppingBag, Star, ShieldCheck, Truck, RotateCcw, ArrowLeft, Send, Eye, Sparkles } from 'lucide-react';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(1);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      if (data.success) {
        setProduct(data.product);
        setFeedbacks(data.feedbacks || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, amount }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Đã thêm ${amount} kính vào giỏ hàng! 🛒`);
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        alert(data.error || 'Vui lòng đăng nhập để mua hàng!');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const res = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, rating, content }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Cảm ơn bạn đã gửi đánh giá kính mát! ⭐');
        setContent('');
        fetchDetail();
      } else {
        alert(data.error || 'Vui lòng đăng nhập để gửi đánh giá');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
        <Header />
        <main className="flex-1 flex items-center justify-center py-20 text-neutral-500 font-medium">
          Đang tải thông tin kính mát...
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-20">
          <p className="text-neutral-400 font-semibold mb-4">Sản phẩm kính không tồn tại.</p>
          <Link href="/products" className="text-amber-400 font-bold hover:underline">
            Quay lại danh sách kính
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Back Link */}
        <Link href="/products" className="inline-flex items-center gap-2 text-neutral-400 hover:text-amber-400 font-medium text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Quay lại danh mục kính
        </Link>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 sm:p-10 mb-12">
          
          {/* Main Product Image */}
          <div className="rounded-2xl overflow-hidden bg-neutral-800 aspect-square relative border border-neutral-750">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-4 left-4 bg-neutral-950/90 text-amber-400 font-bold text-xs px-3.5 py-1.5 rounded-full border border-neutral-800">
              {product.manufacturer || 'Eyewear'}
            </span>
          </div>

          {/* Product Specs & Buying Form */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                {product.cateID?.cname || 'Kính Mắt Cao Cấp'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white mt-1 leading-tight">
                {product.name}
              </h1>

              {/* Eyewear Spec Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="bg-indigo-950/80 text-indigo-300 font-semibold text-xs px-3 py-1 rounded-full border border-indigo-800/50 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> Dáng mắt: {product.frame_shape || 'Thời trang'}
                </span>
                <span className="bg-emerald-950/80 text-emerald-300 font-semibold text-xs px-3 py-1 rounded-full border border-emerald-800/50 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Tròng UV400 Protection
                </span>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>5.0</span>
                </div>
                <span className="text-neutral-500">•</span>
                <span className="text-neutral-400 text-sm font-medium">
                  {feedbacks.length} Đánh giá
                </span>
                <span className="text-neutral-500">•</span>
                <span className="text-emerald-400 font-semibold text-sm">
                  Còn lại: {product.quantity} sản phẩm
                </span>
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800">
                <span className="text-xs text-neutral-400 uppercase font-bold block mb-1">Giá Bán Ưu Đãi</span>
                <span className="text-3xl font-black text-amber-400">
                  {Number(product.price).toLocaleString('vi-VN')}đ
                </span>
              </div>

              <p className="text-neutral-300 text-sm leading-relaxed mt-6">
                {product.description || product.title}
              </p>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4 pt-6 border-t border-neutral-800">
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-neutral-300">Số Lượng:</span>
                <div className="flex items-center bg-neutral-800 rounded-xl border border-neutral-700">
                  <button
                    onClick={() => setAmount(Math.max(1, amount - 1))}
                    className="px-4 py-2 text-neutral-300 hover:text-white font-bold text-lg"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-bold text-white text-base">{amount}</span>
                  <button
                    onClick={() => setAmount(Math.min(product.quantity || 99, amount + 1))}
                    className="px-4 py-2 text-neutral-300 hover:text-white font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full py-4 rounded-2xl font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all shadow-xl shadow-amber-500/20 text-lg flex items-center justify-center gap-3"
              >
                <ShoppingBag className="w-6 h-6" /> Thêm Kính Vào Giỏ Hàng
              </button>
            </div>
          </div>
        </div>

        {/* FEEDBACK & REVIEWS SECTION */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 sm:p-10">
          <h2 className="text-2xl font-black text-white mb-6">Đánh Giá Từ Khách Hàng</h2>

          {/* Submit Review Form */}
          <form onSubmit={handleFeedbackSubmit} className="mb-10 p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
            <h3 className="text-base font-bold text-white">Viết nhận xét của bạn</h3>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-neutral-300">Đánh giá (sao):</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1"
                  >
                    <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-600'}`} />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              required
              placeholder="Chia sẻ nhận xét về tròng kính, độ vừa vặn của gọng..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
            />

            <button
              type="submit"
              disabled={submittingFeedback}
              className="px-6 py-2.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all text-sm flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> Gửi Đánh Giá
            </button>
          </form>

          {/* Feedback List */}
          <div className="space-y-4">
            {feedbacks.length === 0 ? (
              <p className="text-neutral-500 text-sm italic">Chưa có đánh giá nào. Hãy là người đầu tiên nhận xét!</p>
            ) : (
              feedbacks.map((fb) => (
                <div key={fb.id || fb._id} className="p-4 rounded-xl bg-neutral-950 border border-neutral-850">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm">
                      {fb.account_id?.fullname || fb.account_id?.username || 'Khách hàng'}
                    </span>
                    <div className="flex items-center gap-1">
                      {[...Array(fb.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-neutral-300 text-sm">{fb.content}</p>
                  <span className="text-[11px] text-neutral-500 mt-2 block">
                    {new Date(fb.create_date).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
