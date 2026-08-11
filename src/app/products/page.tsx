'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Search, ShoppingBag, Star, Filter, ArrowUpDown, Eye, SlidersHorizontal } from 'lucide-react';

import Image from 'next/image';

interface CategoryItem {
  id?: string;
  _id?: string;
  cname: string;
}

interface ProductItem {
  id?: string;
  _id?: string;
  name: string;
  image: string;
  price: number;
  title?: string;
  description?: string;
  manufacturer?: string;
  frame_shape?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedShape, setSelectedShape] = useState('');
  const [sort, setSort] = useState('newest');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category', selectedCategory);
      if (sort) params.append('sort', sort);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        let prods: ProductItem[] = data.products || [];
        if (selectedBrand) {
          prods = prods.filter((p) => p.manufacturer && p.manufacturer.toLowerCase().includes(selectedBrand.toLowerCase()));
        }
        if (selectedShape) {
          prods = prods.filter((p) => p.frame_shape && p.frame_shape.toLowerCase().includes(selectedShape.toLowerCase()));
        }
        setProducts(prods);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, sort, selectedBrand, selectedShape]);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      fetch('/api/categories')
        .then(res => res.json())
        .then(data => { if (isMounted && data.success) setCategories(data.categories || []); });
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) {
        fetchProducts();
      }
    });
    return () => {
      isMounted = false;
    };
  }, [fetchProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
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
        alert(data.error || 'Vui lòng đăng nhập!');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const brandsList = ['Ray-Ban', 'Gentle Monster', 'Oakley', 'Tom Ford', 'Gucci'];
  const shapesList = ['Mắt Phi Công (Aviator)', 'Mắt Vuông (Square)', 'Mắt Tròn (Round)', 'Mắt Mèo (Cat-Eye)', 'Gọng Chữ Nhật (Rectangle)'];

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header Title */}
        <div className="mb-8 border-b border-neutral-850 pb-6">
          <h1 className="text-3xl font-black text-white tracking-tight">Danh Mục Kính Mắt & Kính Râm Hàng Hiệu</h1>
          <p className="text-neutral-400 text-sm mt-1">Tuyển chọn các mẫu kính râm & gọng kính chính hãng nhập khẩu Ý, Hàn Quốc, Mỹ</p>
        </div>

        {/* Filter Controls */}
        <div className="space-y-4 mb-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center relative max-w-md">
              <input
                type="text"
                placeholder="Tìm theo tên kính, thương hiệu Ray-Ban, GM..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-amber-500"
              />
              <button type="submit" className="absolute right-3 text-neutral-400 hover:text-amber-400">
                <Search className="w-5 h-5" />
              </button>
            </form>

            {/* Sort Select */}
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm">
              <ArrowUpDown className="w-4 h-4 text-amber-400" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-transparent text-white focus:outline-none font-medium cursor-pointer"
              >
                <option value="newest" className="bg-neutral-900 text-white">Mới nhất</option>
                <option value="price_asc" className="bg-neutral-900 text-white">Giá: Thấp đến Cao</option>
                <option value="price_desc" className="bg-neutral-900 text-white">Giá: Cao đến Thấp</option>
              </select>
            </div>
          </div>

          {/* Dual Filter Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            
            {/* Category Select */}
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm">
              <Filter className="w-4 h-4 text-amber-400 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-transparent text-white focus:outline-none font-medium cursor-pointer"
              >
                <option value="" className="bg-neutral-900 text-white">-- Tất cả loại kính --</option>
                {categories.map((c, idx) => {
                  const catId = c.id || c._id || `cat-${idx}`;
                  return (
                    <option key={catId} value={catId} className="bg-neutral-900 text-white">
                      {c.cname}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Brand Select */}
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm">
              <SlidersHorizontal className="w-4 h-4 text-amber-400 shrink-0" />
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-transparent text-white focus:outline-none font-medium cursor-pointer"
              >
                <option value="" className="bg-neutral-900 text-white">-- Tất cả thương hiệu --</option>
                {brandsList.map((b) => (
                  <option key={b} value={b} className="bg-neutral-900 text-white">
                    Thương hiệu: {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Frame Shape Select */}
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm">
              <Eye className="w-4 h-4 text-indigo-400 shrink-0" />
              <select
                value={selectedShape}
                onChange={(e) => setSelectedShape(e.target.value)}
                className="w-full bg-transparent text-white focus:outline-none font-medium cursor-pointer"
              >
                <option value="" className="bg-neutral-900 text-white">-- Tất cả kiểu dáng mắt --</option>
                {shapesList.map((s) => (
                  <option key={s} value={s} className="bg-neutral-900 text-white">
                    Kiểu dáng: {s}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-20 text-neutral-500 font-medium">Đang tải kính mắt...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/40 rounded-3xl border border-neutral-800">
            <p className="text-neutral-400 font-semibold">Không tìm thấy mẫu kính nào phù hợp với bộ lọc.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {products.map((product, idx) => {
              const prodId = product.id || product._id || `prod-${idx}`;
              return (
                <div
                  key={prodId}
                  className="group bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col"
                >
                  <Link href={`/products/${prodId}`} className="relative block aspect-square overflow-hidden bg-neutral-800">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      unoptimized
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-neutral-950/80 backdrop-blur-sm text-amber-400 font-bold text-[9px] sm:text-[11px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-neutral-800">
                      {product.manufacturer || 'Eyewear'}
                    </span>
                    {product.frame_shape && (
                      <span className="hidden sm:inline-block absolute bottom-3 left-3 bg-indigo-950/80 backdrop-blur-sm text-indigo-300 font-medium text-[10px] px-2 py-0.5 rounded-full border border-indigo-800/50">
                        {product.frame_shape}
                      </span>
                    )}
                  </Link>

                  <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-amber-400 text-[10px] sm:text-xs font-bold mb-1">
                        <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400" /> 5.0 (Review)
                      </div>
                      <Link href={`/products/${prodId}`}>
                        <h3 className="font-bold text-white text-xs sm:text-base line-clamp-1 group-hover:text-amber-400 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-neutral-400 line-clamp-2 mt-1 font-normal hidden sm:block">
                        {product.description || product.title}
                      </p>
                    </div>

                    <div className="pt-2 sm:pt-4 mt-2 sm:mt-4 border-t border-neutral-800 flex items-center justify-between gap-1">
                      <div>
                        <span className="block text-[9px] sm:text-[10px] text-neutral-500 uppercase font-semibold">Giá Bán</span>
                        <span className="font-black text-amber-400 text-xs sm:text-lg">
                          {Number(product.price).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      <button
                        onClick={() => handleAddToCart(prodId)}
                        className="p-2 sm:p-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition-all shadow-md shrink-0"
                        title="Thêm vào giỏ hàng"
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
      </main>

      <Footer />
    </div>
  );
}
