'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShoppingBag, Star, ArrowRight, Tag, Sparkles, Eye, SlidersHorizontal } from 'lucide-react';

interface CategoryType {
  id?: string;
  _id?: string;
  cname: string;
}

interface ProductType {
  id?: string;
  _id?: string;
  name: string;
  image: string;
  price: number;
  title?: string;
  description?: string;
  cate_id?: string;
  cateID?: string | { id?: string; _id?: string };
  manufacturer?: string;
  frame_shape?: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
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
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) {
        fetchData();
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

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
    const catId = p.cate_id || (typeof p.cateID === 'object' ? (p.cateID?.id || p.cateID?._id) : p.cateID);
    const matchesCategory = activeCategory === 'all' || catId === activeCategory;
    const matchesBrand = activeBrand === 'all' || (p.manufacturer && p.manufacturer.toLowerCase().includes(activeBrand.toLowerCase()));
    const matchesShape = activeShape === 'all' || (p.frame_shape && p.frame_shape.toLowerCase().includes(activeShape.toLowerCase()));
    return matchesCategory && matchesBrand && matchesShape;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans overflow-x-hidden">
      <Header />

      <main className="flex-1">
        {/* HERO BANNER SECTION WITH AMBIENT GLOW ANIMATIONS */}
        <section className="relative overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 py-12 sm:py-20 lg:py-28 border-b border-neutral-850">
          {/* Glowing Ambient Background Orbs */}
          <div className="absolute top-1/4 left-10 w-72 h-72 sm:w-96 sm:h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-80 h-80 sm:w-[30rem] sm:h-[30rem] bg-indigo-600/10 rounded-full blur-3xl animate-pulse pointer-events-none delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[20rem] bg-rose-500/5 rounded-full blur-3xl animate-pulse pointer-events-none delay-500" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
            
            <div className="space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-amber-500/40 text-amber-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-500/10 backdrop-blur-md transition-all hover:scale-105">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                <span>👓 BỘ SƯU TẬP KÍNH MẮT HÀNG HIỆU 2026</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Nâng Tầm Ánh Nhìn <br />
                <span className="bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500 bg-clip-text text-transparent animate-gradient">
                  Kính Mắt Đỉnh Cao 🕶️
                </span>
              </h1>

              <p className="text-neutral-400 text-sm sm:text-base lg:text-lg max-w-xl font-normal leading-relaxed">
                Khám phá thế giới kính mát và kính cận hàng hiệu Ray-Ban, Gentle Monster, Oakley, Gucci với thiết kế thời thượng và chống tia UV400 bảo vệ mắt tối đa.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/products"
                  className="group w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-black bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-neutral-950 hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                >
                  Khám Phá Bộ Sưu Tập{' '}
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Animated Stats Badge */}
              <div className="grid grid-cols-3 gap-2 sm:gap-6 pt-6 border-t border-neutral-900/90">
                <div className="p-3 rounded-2xl bg-neutral-900/40 border border-neutral-850 hover:border-amber-500/30 transition-colors">
                  <h3 className="text-xl sm:text-2xl font-black text-white">100%</h3>
                  <p className="text-[10px] sm:text-xs text-neutral-400 font-medium">Chính Hãng Ray-Ban / GM</p>
                </div>
                <div className="p-3 rounded-2xl bg-neutral-900/40 border border-neutral-850 hover:border-amber-500/30 transition-colors">
                  <h3 className="text-xl sm:text-2xl font-black text-amber-400">UV400</h3>
                  <p className="text-[10px] sm:text-xs text-neutral-400 font-medium">Bảo Vệ Mắt Tuyệt Đối</p>
                </div>
                <div className="p-3 rounded-2xl bg-neutral-900/40 border border-neutral-850 hover:border-amber-500/30 transition-colors">
                  <h3 className="text-xl sm:text-2xl font-black text-white">24/7</h3>
                  <p className="text-[10px] sm:text-xs text-neutral-400 font-medium">Tư Vấn AI Trực Tuyến</p>
                </div>
              </div>
            </div>

            {/* Hero Showcase Card With Hover Glow */}
            <div className="relative group mt-4 lg:mt-0">
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 rounded-3xl blur-2xl opacity-30 group-hover:opacity-60 transition duration-700 animate-pulse"></div>
              <div className="relative rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl group-hover:-translate-y-2 transition-transform duration-500">
                <Image
                  src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80"
                  alt="Ray-Ban Aviator Hero"
                  width={600}
                  height={480}
                  unoptimized
                  className="w-full h-[280px] sm:h-[400px] lg:h-[480px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />

                {/* Floating Hot Badge */}
                <div className="absolute top-4 right-4 bg-amber-500 text-neutral-950 font-black text-[10px] sm:text-xs px-3 py-1 rounded-full shadow-xl animate-bounce uppercase tracking-wider">
                  🔥 BESTSELLER 2026
                </div>

                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 bg-neutral-900/90 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-neutral-800 flex items-center justify-between shadow-2xl">
                  <div>
                    <p className="text-[10px] sm:text-xs text-amber-400 font-bold uppercase tracking-wider">Chính Hãng Ray-Ban 👓</p>
                    <h4 className="font-bold text-white text-xs sm:text-base line-clamp-1">Ray-Ban Aviator Classic Gold</h4>
                  </div>
                  <span className="font-black text-amber-400 text-sm sm:text-lg shrink-0 ml-2">3.850.000đ</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* BRAND & FRAME SHAPE FAST FILTERS */}
        <section className="py-6 sm:py-8 bg-neutral-900/50 border-b border-neutral-850 space-y-4">
          
          {/* Category Selector */}
          {categories.length > 0 && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Tag className="w-4 h-4" /> Lọc Theo Danh Mục Kính:
              </div>
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                    activeCategory === 'all'
                      ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/25 scale-105'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-750'
                  }`}
                >
                  ✨ Tất Cả Loại Kính
                </button>
                {categories.map((c, idx) => {
                  const catId = c.id || c._id || `c-${idx}`;
                  return (
                    <button
                      key={catId}
                      onClick={() => setActiveCategory(catId)}
                      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                        activeCategory === catId
                          ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/25 scale-105'
                          : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-750'
                      }`}
                    >
                      {c.cname}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
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
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                    activeBrand === brand
                      ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/25 scale-105'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-750'
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
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                    activeShape === shape
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 scale-105'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-750'
                  }`}
                >
                  {shape === 'all' ? '🕶️ Tất Cả Kiểu Dáng' : shape}
                </button>
              ))}
            </div>
          </div>

        </section>

        {/* FEATURED PRODUCTS GRID WITH SKELETON SHIMMER & HOVER ANIMATIONS */}
        <section className="py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 sm:mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Kính Mắt Mới & Nổi Bật</h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">Tuyển chọn các mẫu kính râm & gọng kính cao cấp nhất</p>
            </div>
            <Link href="/products" className="group text-xs sm:text-sm font-bold text-amber-400 hover:underline flex items-center gap-1 shrink-0">
              Xem tất cả <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            /* Shimmer Skeleton Loading State */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-neutral-900 border border-neutral-850 rounded-2xl h-80 flex flex-col justify-between p-4">
                  <div className="w-full h-44 bg-neutral-800 rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-4 bg-neutral-800 rounded w-3/4" />
                    <div className="h-3 bg-neutral-800 rounded w-1/2" />
                  </div>
                  <div className="h-8 bg-neutral-800 rounded-xl w-full" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-neutral-900/40 rounded-3xl border border-neutral-850 shadow-xl">
              <p className="text-neutral-400 font-semibold">Chưa có mẫu kính nào theo bộ lọc này.</p>
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setActiveBrand('all');
                  setActiveShape('all');
                }}
                className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {filteredProducts.map((product, idx) => {
                const prodId = product.id || product._id || `prod-${idx}`;
                return (
                  <div
                    key={prodId}
                    className="group bg-neutral-900/90 border border-neutral-800/90 hover:border-amber-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01] hover:shadow-2xl hover:shadow-amber-500/15 flex flex-col"
                  >
                    {/* Product Image Showcase with Hover Zoom & Quick Eye Button */}
                    <Link href={`/products/${prodId}`} className="relative block aspect-square overflow-hidden bg-neutral-800">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        unoptimized
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      
                      {/* Brand Pill */}
                      <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-neutral-950/85 backdrop-blur-md text-amber-400 font-bold text-[9px] sm:text-[11px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-neutral-800 shadow-md">
                        {product.manufacturer || 'Eyewear'}
                      </span>

                      {/* Shape Pill */}
                      {product.frame_shape && (
                        <span className="hidden sm:inline-block absolute bottom-3 left-3 bg-indigo-950/85 backdrop-blur-md text-indigo-300 font-medium text-[10px] px-2 py-0.5 rounded-full border border-indigo-800/50 shadow-md">
                          {product.frame_shape}
                        </span>
                      )}

                      {/* Eye Quick Overlay on Hover */}
                      <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="px-3.5 py-1.5 bg-amber-500 text-neutral-950 font-bold text-xs rounded-xl shadow-xl flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                          <Eye className="w-4 h-4" /> Xem Kính
                        </span>
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1 text-amber-400 text-[10px] sm:text-xs font-bold mb-1">
                          <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400" /> 5.0
                        </div>
                        <Link href={`/products/${prodId}`}>
                          <h3 className="font-bold text-white text-xs sm:text-base line-clamp-1 group-hover:text-amber-400 transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-[11px] sm:text-xs text-neutral-400 line-clamp-2 mt-0.5 sm:mt-1 font-normal hidden sm:block">
                          {product.description || product.title}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-neutral-800/60 flex items-center justify-between">
                        <div>
                          <span className="block text-[10px] text-neutral-500 uppercase font-semibold">Giá Bán</span>
                          <span className="font-black text-amber-400 text-base sm:text-lg">
                            {Number(product.price).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                        <button
                          onClick={() => handleAddToCart(prodId)}
                          className="p-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition-all shadow-lg hover:scale-110 active:scale-95 group-hover:rotate-6"
                          title="Thêm kính vào giỏ hàng"
                        >
                          <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* PROMOTION VOUCHER BANNER WITH GLOW ANIMATION */}
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-700 p-8 sm:p-12 shadow-2xl group hover:shadow-amber-500/20 transition-all duration-500">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="px-3.5 py-1.5 rounded-full bg-neutral-950/50 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                <Tag className="w-4 h-4 text-amber-300 animate-pulse" /> MÃ GIẢM GIÁ ĐẶC BIỆT KÍNH MẮT
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Giảm Ngay 20% Cho Đơn Hàng Kính Mắt Đầu Tiên
              </h2>
              <p className="text-white/90 text-sm sm:text-base">
                Nhập mã <span className="bg-neutral-950 px-3 py-1 rounded-lg text-amber-300 font-mono font-black text-base border border-amber-400/40 shadow-inner">KINH20</span> khi thanh toán để nhận ngay ưu đãi giảm tới 500.000đ!
              </p>
              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-block px-7 py-3.5 rounded-xl bg-neutral-950 hover:bg-neutral-900 text-amber-400 font-extrabold text-sm shadow-xl hover:scale-105 transition-all duration-300"
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
