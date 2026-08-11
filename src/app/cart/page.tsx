'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShoppingBag, Clock, Trash2, ShieldCheck, ArrowRight } from 'lucide-react';

interface CartItemType {
  _id: string;
  amount: number;
  product_id?: {
    _id: string;
    name: string;
    image: string;
    price: number;
    manufacturer?: string;
  };
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      if (data.success) {
        setCartItems(data.cart || []);
      }
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
        fetchCart();
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdateQuantity = async (productId: string, amount: number) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, amount }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCart();
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      const res = await fetch(`/api/cart?productId=${productId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchCart();
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product_id?.price || 0;
    return sum + price * item.amount;
  }, 0);

  const vat = Math.round((subtotal * 10) / 100);
  const total = subtotal + vat;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Giỏ Hàng Kính Mắt Của Bạn</h1>
            <p className="text-sm text-neutral-400 mt-1">Quản lý và kiểm tra danh sách sản phẩm trước khi thanh toán</p>
          </div>
          <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs">
            {cartItems.length} Sản Phẩm
          </span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-neutral-500 font-medium">Đang tải giỏ hàng...</div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/50 rounded-3xl border border-neutral-800 space-y-4">
            <ShoppingBag className="w-16 h-16 text-neutral-600 mx-auto" />
            <h3 className="text-xl font-bold text-white">Giỏ hàng kính mắt của bạn đang trống</h3>
            <p className="text-neutral-400 text-sm">Hãy chọn các mẫu kính hàng hiệu yêu thích và thêm vào giỏ hàng ngay!</p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-md"
            >
              Khám Phá Kính Mắt Ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-2.5">
                <Clock className="w-4 h-4 shrink-0 text-amber-400" /> Các sản phẩm được giữ trong giỏ hàng 2 tiếng trước khi tự động giải phóng tồn kho.
              </div>

              {cartItems.map((item) => {
                const prod = item.product_id;
                if (!prod) return null;

                return (
                  <div
                    key={item._id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-neutral-750 transition-all shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Image
                        src={prod.image}
                        alt={prod.name}
                        width={96}
                        height={96}
                        unoptimized
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl bg-neutral-800 border border-neutral-750 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-sm sm:text-base line-clamp-1">{prod.name}</h4>
                        <p className="text-xs text-neutral-400 mt-0.5">{prod.manufacturer || 'Eyewear Boutique'}</p>
                        <p className="text-xs text-amber-400 font-bold mt-1">
                          {Number(prod.price).toLocaleString('vi-VN')}đ / chiếc
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800/80">
                      <div className="flex items-center bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden">
                        <button
                          onClick={() => handleUpdateQuantity(prod._id, item.amount - 1)}
                          className="px-3 py-1 font-black text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors text-sm"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-sm font-bold text-white bg-neutral-850">{item.amount}</span>
                        <button
                          onClick={() => handleUpdateQuantity(prod._id, item.amount + 1)}
                          className="px-3 py-1 font-black text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors text-sm"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-neutral-500 block font-bold uppercase tracking-wider">Thành Tiền</span>
                          <span className="font-black text-amber-400 text-base sm:text-xl">
                            {Number(prod.price * item.amount).toLocaleString('vi-VN')}đ
                          </span>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(prod._id)}
                          className="text-neutral-400 hover:text-rose-400 p-1.5 hover:bg-rose-500/10 rounded-xl transition-colors ml-1"
                          title="Xóa kính khỏi giỏ hàng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary Card */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 h-fit space-y-6 shadow-xl">
              <h3 className="text-lg font-black text-white border-b border-neutral-800 pb-4 flex items-center justify-between">
                Tóm Tắt Đơn Hàng
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </h3>

              {/* Price Breakdown */}
              <div className="space-y-3 text-sm pt-2">
                <div className="flex justify-between text-neutral-400">
                  <span>Tạm tính ({cartItems.length} món)</span>
                  <span className="font-semibold text-white">{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Thuế VAT (10%)</span>
                  <span className="font-semibold text-white">{vat.toLocaleString('vi-VN')}đ</span>
                </div>
                
                <div className="flex justify-between text-lg font-black text-white border-t border-neutral-800 pt-4">
                  <span>Tổng cộng</span>
                  <span className="text-amber-400">{total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full py-4 rounded-2xl font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all shadow-xl shadow-amber-500/20 text-base flex items-center justify-center gap-2"
              >
                Tiến Hành Thanh Toán <ArrowRight className="w-5 h-5" />
              </Link>

              <p className="text-[11px] text-neutral-500 text-center font-medium">
                💡 Mã giảm giá (Voucher) sẽ được áp dụng tại trang Thanh Toán.
              </p>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
