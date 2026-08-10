'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShoppingBag, Star, ArrowRight, ShieldCheck, Tag, Sparkles, RefreshCw, Eye, SlidersHorizontal } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeBrand, setActiveBrand] = useState<string>('all');
  const [activeShape, setActiveShape] = useState<string>('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const resCat = await fetch('/api/categories');
      const dataCat = await resCat.json();
      if (dataCat.success) setCategories(dataCat.categories || []);

      const resProd = await fetch('/api/products?limit=20');
      const dataProd = await resProd.json();
      if (dataProd.success) setProducts(dataProd.products || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/seed');
      const data = await res.json();
      alert(data.message || 'Khởi tạo dữ liệu mẫu kính mắt thành công!');
      fetchData();
    } catch (error: any) {
      alert('Lỗi khởi tạo: ' + error.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, amount: 1 }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Đã thêm sản phẩm kính vào giỏ hàng! 🛒');
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        alert(data.error || 'Vui lòng đăng nhập để mua hàng!');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const brandsList = ['all', 'Ray-Ban', 'Gentle Monster', 'Oakley', 'Tom Ford', 'Gucci'];
  const shapesList = ['all', 'Mắt Phi Công (Aviator)', 'Mắt Vuông (Square)', 'Mắt Tròn (Round)', 'Mắt Mèo (Cat-Eye)', 'Gọng Chữ Nhật (Rectangle)'];

  const filteredProducts = products.filter(p => {
    const catId = p.cate_id || p.cateID?.id || p.cateID?._id || p.cateID;
    const matchesCategory = activeCategory === 'all' || catId === activeCategory;
    const matchesBrand = activeBrand === 'all' || (p.manufacturer && p.manufacturer.toLowerCase().includes(activeBrand.toLowerCase()));
    const matchesShape = activeShape === 'all' || (p.frame_shape && p.frame_shape.toLowerCase().includes(activeShape.toLowerCase()));
    return matchesCategory && matchesBrand && matchesShape;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        {/* HERO BANNER SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 py-16 lg:py-24 border-b border-neutral-850">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6 z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400" /> 👓 BỘ SƯU TẬP KÍNH MẮT HÀNG HIỆU 2026
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
                Nâng Tầm Ánh Nhìn <br />
                <span className="bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500 bg-clip-text text-transparent">
                  Kính Mắt Đỉnh Cao 🕶️
                </span>
              </h1>

              <p className="text-neutral-400 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
                Khám phá thế giới kính mát và kính cận hàng hiệu Ray-Ban, Gentle Monster, Oakley, Gucci với thiết kế thời thượng và chống tia UV400 bảo vệ mắt tối đa.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl shadow-amber-500/20 text-base"
                >
                  Khám Phá Bộ Sưu Tập <ArrowRight className="w-5 h-5" />
                </Link>

                <button
                  onClick={handleSeedData}
                  disabled={seeding}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-amber-500/50 transition-colors text-sm"
                >
                  <RefreshCw className={`w-4 h-4 text-amber-400 ${seeding ? 'animate-spin' : ''}`} />
                  {seeding ? 'Đang tạo dữ liệu...' : 'Nạp Dữ Liệu Kính Mẫu (Seed)'}
                </button>
              </div>

              {/* Stats Badge */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-neutral-900">
                <div>
                  <h3 className="text-2xl font-black text-white">100%</h3>
                  <p className="text-xs text-neutral-500">Chính Hãng Ray-Ban / GM</p>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-amber-400">UV400</h3>
                  <p className="text-xs text-neutral-500">Bảo Vệ Mắt Tuyệt Đối</p>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">24/7</h3>
                  <p className="text-xs text-neutral-500">Tư Vấn Trực Tuyến</p>
                </div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-indigo-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80"
                  alt="Ray-Ban Aviator Hero"
                  className="w-full h-[400px] sm:h-[480px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-neutral-900/90 backdrop-blur-md p-4 rounded-2xl border border-neutral-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Top Best Seller 👓</p>
                    <h4 className="font-bold text-white text-base">Ray-Ban Aviator Classic Gold</h4>
                  </div>
                  <span className="font-black text-amber-400 text-lg">3.850.000đ</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* BRAND & FRAME SHAPE FAST FILTERS */}
        <section className="py-8 bg-neutral-900/60 border-b border-neutral-850 space-y-4">
          
          {/* Brand Selector */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <SlidersHorizontal className="w-4 h-4" /> Lọc Theo Thương Hiệu:
            </div>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {brandsList.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setActiveBrand(brand)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    activeBrand === brand
                      ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
                  }`}
                >
                  {brand === 'all' ? '✨ Tất Cả Hãng' : brand}
                </button>
              ))}
            </div>
          </div>

          {/* Frame Shape Selector */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Eye className="w-4 h-4" /> Lọc Theo Kiểu Dáng Mắt:
            </div>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {shapesList.map((shape) => (
                <button
                  key={shape}
                  onClick={() => setActiveShape(shape)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    activeShape === shape
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
                  }`}
                >
                  {shape === 'all' ? '🕶️ Tất Cả Kiểu Dáng' : shape}
                </button>
              ))}
            </div>
          </div>

        </section>

        {/* FEATURED PRODUCTS GRID */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">Kính Mắt Mới & Nổi Bật</h2>
              <p className="text-sm text-neutral-400">Tuyển chọn các mẫu kính râm & gọng kính cao cấp nhất</p>
            </div>
            <Link href="/products" className="text-sm font-bold text-amber-400 hover:underline flex items-center gap-1">
              Xem tất cả kính <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-20 text-neutral-500 font-medium">Đang tải danh sách kính mắt...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-neutral-900/40 rounded-3xl border border-neutral-850">
              <p className="text-neutral-400 font-semibold mb-4">Chưa có mẫu kính phù hợp với bộ lọc đã chọn.</p>
              <button
                onClick={handleSeedData}
                className="px-6 py-2.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-sm shadow-md"
              >
                Nạp dữ liệu kính mẫu (Seed)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product, idx) => {
                const prodId = product.id || product._id || `prod-${idx}`;
                return (
                  <div
                    key={prodId}
                    className="group bg-neutral-900/80 border border-neutral-800/90 hover:border-amber-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col"
                  >
                    {/* Product Image */}
                    <Link href={`/products/${prodId}`} className="relative block aspect-square overflow-hidden bg-neutral-800">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-sm text-amber-400 font-bold text-[11px] px-2.5 py-1 rounded-full border border-neutral-800">
                        {product.manufacturer || 'Eyewear'}
                      </span>

                      {product.frame_shape && (
                        <span className="absolute bottom-3 left-3 bg-indigo-950/80 backdrop-blur-sm text-indigo-300 font-medium text-[10px] px-2 py-0.5 rounded-full border border-indigo-800/50">
                          {product.frame_shape}
                        </span>
                      )}
                    </Link>

                    {/* Product Info */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1 text-amber-400 text-xs font-bold mb-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400" /> 5.0 (32 Đánh giá)
                        </div>
                        <Link href={`/products/${prodId}`}>
                          <h3 className="font-bold text-white text-base line-clamp-1 group-hover:text-amber-400 transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-neutral-400 line-clamp-2 mt-1 font-normal">
                          {product.description || product.title}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-neutral-800/60 flex items-center justify-between">
                        <div>
                          <span className="block text-[10px] text-neutral-500 uppercase font-semibold">Giá Bán</span>
                          <span className="font-black text-amber-400 text-lg">
                            {Number(product.price).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                        <button
                          onClick={() => handleAddToCart(prodId)}
                          className="p-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition-all shadow-md hover:scale-105"
                          title="Thêm kính vào giỏ hàng"
                        >
                          <ShoppingBag className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* PROMOTION VOUCHER BANNER */}
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-600 via-rose-600 to-purple-700 p-8 sm:p-12 shadow-2xl">
            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="px-3.5 py-1 rounded-full bg-neutral-950/40 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-amber-300" /> MÃ GIẢM GIÁ ĐẶC BIỆT KÍNH MẮT
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Giảm Ngay 20% Cho Đơn Hàng Kính Mắt Đầu Tiên
              </h2>
              <p className="text-white/90 text-sm sm:text-base">
                Nhập mã <span className="bg-neutral-950 px-3 py-1 rounded-lg text-amber-300 font-mono font-black text-base border border-amber-400/40">KINH20</span> khi thanh toán để nhận ngay ưu đãi giảm tới 500.000đ!
              </p>
              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-block px-6 py-3 rounded-xl bg-neutral-950 hover:bg-neutral-900 text-amber-400 font-extrabold text-sm shadow-lg transition-all"
                >
                  Mua Kính Ngay Áp Mã KINH20 →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
