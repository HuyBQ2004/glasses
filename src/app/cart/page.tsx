'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShoppingBag, Trash2, ArrowRight, Clock, Tag } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [voucherCode, setVoucherCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState<any>(null);
  const [voucherMsg, setVoucherMsg] = useState('');

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
    fetchCart();
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

  const handleApplyVoucher = async () => {
    if (!voucherCode) return;
    try {
      const res = await fetch(`/api/vouchers?code=${voucherCode.trim()}`);
      const data = await res.json();
      if (data.success && data.voucher) {
        setDiscountInfo(data.voucher);
        setVoucherMsg(`Đã áp dụng mã ${data.voucher.code}: Giảm ${data.voucher.discount_percent}%`);
      } else {
        setDiscountInfo(null);
        setVoucherMsg(data.error || 'Mã giảm giá không hợp lệ');
      }
    } catch (error) {
      setVoucherMsg('Không thể áp dụng mã');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product_id?.price || 0;
    return sum + price * item.amount;
  }, 0);

  let discount = 0;
  if (discountInfo && subtotal >= (discountInfo.min_order_value || 0)) {
    discount = (subtotal * discountInfo.discount_percent) / 100;
    if (discountInfo.max_discount && discount > discountInfo.max_discount) {
      discount = discountInfo.max_discount;
    }
  }

  const vat = Math.round(((subtotal - discount) * 10) / 100);
  const total = subtotal - discount + vat;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <h1 className="text-3xl font-black text-white tracking-tight mb-8">Giỏ Hàng Của Bạn</h1>

        {loading ? (
          <div className="text-center py-20 text-neutral-500 font-medium">Đang tải giỏ hàng...</div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/50 rounded-3xl border border-neutral-800 space-y-4">
            <ShoppingBag className="w-16 h-16 text-neutral-600 mx-auto" />
            <h3 className="text-xl font-bold text-white">Giỏ hàng của bạn đang trống</h3>
            <p className="text-neutral-400 text-sm">Hãy chọn các mẫu giày yêu thích và thêm vào giỏ hàng ngay!</p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-md"
            >
              Khám Phá Sản Phẩm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4" /> Các sản phẩm được giữ trong giỏ 2 tiếng trước khi tự động giải phóng tồn kho.
              </div>

              {cartItems.map((item) => {
                const prod = item.product_id;
                if (!prod) return null;

                return (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-900 border border-neutral-800"
                  >
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-20 h-20 object-cover rounded-xl bg-neutral-800"
                    />

                    <div className="flex-1">
                      <h4 className="font-bold text-white text-base line-clamp-1">{prod.name}</h4>
                      <p className="text-xs text-amber-400 font-semibold mt-1">
                        {Number(prod.price).toLocaleString('vi-VN')}đ / đôi
                      </p>

                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center bg-neutral-800 rounded-lg border border-neutral-700">
                          <button
                            onClick={() => handleUpdateQuantity(prod._id, item.amount - 1)}
                            className="px-3 py-1 font-bold text-neutral-300 hover:text-white"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-sm font-bold text-white">{item.amount}</span>
                          <button
                            onClick={() => handleUpdateQuantity(prod._id, item.amount + 1)}
                            className="px-3 py-1 font-bold text-neutral-300 hover:text-white"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(prod._id)}
                          className="text-neutral-500 hover:text-rose-400 p-1"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-neutral-500 block font-semibold">Thành Tiền</span>
                      <span className="font-black text-white text-lg">
                        {Number(prod.price * item.amount).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary & Voucher */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 h-fit space-y-6">
              <h3 className="text-lg font-black text-white border-b border-neutral-800 pb-4">Tóm Tắt Đơn Hàng</h3>

              {/* Voucher Code */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Mã Giảm Giá (Voucher)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="VD: GIAM20"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none uppercase font-mono font-bold"
                  />
                  <button
                    onClick={handleApplyVoucher}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-sm rounded-xl border border-neutral-700"
                  >
                    Áp Dụng
                  </button>
                </div>
                {voucherMsg && (
                  <p className={`text-xs mt-2 ${discountInfo ? 'text-emerald-400 font-bold' : 'text-rose-400'}`}>
                    {voucherMsg}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 text-sm border-t border-neutral-800 pt-4">
                <div className="flex justify-between text-neutral-400">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-white">{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-amber-400 font-semibold">
                    <span>Giảm giá voucher</span>
                    <span>-{discount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-400">
                  <span>Thuế VAT (10%)</span>
                  <span className="font-semibold text-white">{vat.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-lg font-black text-white border-t border-neutral-800 pt-3">
                  <span>Tổng cộng</span>
                  <span className="text-amber-400">{total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <Link
                href={`/checkout${discountInfo ? `?voucher=${discountInfo.code}` : ''}`}
                className="w-full py-4 rounded-2xl font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all shadow-xl shadow-amber-500/20 text-base flex items-center justify-center gap-2"
              >
                Tiến Hành Thanh Toán <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
