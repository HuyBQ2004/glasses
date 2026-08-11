'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CreditCard, Truck, Tag, Check, X, QrCode } from 'lucide-react';

interface CartItem {
  id?: string;
  _id?: string;
  amount: number;
  product_id?: {
    price?: number;
    name?: string;
  };
}

interface Voucher {
  id?: string;
  _id?: string;
  code: string;
  discount_percent: number;
  max_discount?: number;
  min_order_value?: number;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const voucherQuery = searchParams.get('voucher') || '';

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [voucherCode, setVoucherCode] = useState(voucherQuery);
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState('');
  const [voucherSuccess, setVoucherSuccess] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'PayOS'>('COD');
  const [error, setError] = useState('');

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product_id?.price || 0) * item.amount, 0);

  const handleApplyVoucher = useCallback(async (codeToApply?: string) => {
    const code = (codeToApply || voucherCode).trim().toUpperCase();
    setVoucherError('');
    setVoucherSuccess('');

    if (!code) {
      setAppliedVoucher(null);
      return;
    }

    try {
      const res = await fetch(`/api/vouchers?code=${encodeURIComponent(code)}`);
      const data = await res.json();

      if (!data.success || !data.voucher) {
        setVoucherError(data.error || 'Mã giảm giá không hợp lệ');
        setAppliedVoucher(null);
        return;
      }

      const v = data.voucher;
      if (subtotal < (v.min_order_value || 0)) {
        setVoucherError(`Đơn hàng phải từ ${Number(v.min_order_value).toLocaleString('vi-VN')}đ để dùng mã ${v.code}`);
        setAppliedVoucher(null);
        return;
      }

      setAppliedVoucher(v);
      setVoucherSuccess(`Đã áp dụng mã giảm giá ${v.code} (-${v.discount_percent}%)!`);
    } catch {
      setVoucherError('Lỗi kiểm tra mã giảm giá');
      setAppliedVoucher(null);
    }
  }, [voucherCode, subtotal]);

  useEffect(() => {
    // fetch currentUser to prefill form
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setName(data.user.fullname || '');
          setPhone(data.user.phone || '');
          setAddress(data.user.address || '');
        }
      });

    // fetch cart
    fetch('/api/cart')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCartItems(data.cart || []);
        }
      })
      .finally(() => setLoading(false));

    // fetch available vouchers from DB
    fetch('/api/vouchers')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAvailableVouchers(data.vouchers || []);
        }
      });
  }, []);

  // Auto apply voucher if passed via query or select
  useEffect(() => {
    let isMounted = true;
    if (voucherCode && subtotal > 0) {
      Promise.resolve().then(() => {
        if (isMounted) handleApplyVoucher(voucherCode);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [voucherCode, subtotal, handleApplyVoucher]);

  const handleRemoveVoucher = () => {
    setVoucherCode('');
    setAppliedVoucher(null);
    setVoucherError('');
    setVoucherSuccess('');
  };

  // Compute discount amount
  let discountAmount = 0;
  if (appliedVoucher) {
    discountAmount = (subtotal * appliedVoucher.discount_percent) / 100;
    if (appliedVoucher.max_discount && discountAmount > appliedVoucher.max_discount) {
      discountAmount = appliedVoucher.max_discount;
    }
  }

  const vatPercent = 10;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const vatAmount = (taxableAmount * vatPercent) / 100;
  const finalTotal = Math.round(taxableAmount + vatAmount);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // 1. Create Checkout Order
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          address,
          note,
          voucherCode: appliedVoucher ? appliedVoucher.code : '',
          paymentMethod,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Đặt hàng không thành công');
        setSubmitting(false);
        return;
      }

      window.dispatchEvent(new Event('cartUpdated'));

      // 2. If PayOS, create Payment Link and Redirect to PayOS VietQR Gateway
      if (paymentMethod === 'PayOS') {
        const payosRes = await fetch('/api/payos/create-payment-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: data.orderId,
            amount: data.totalPrice,
          }),
        });
        const payosData = await payosRes.json();
        if (payosData.success && payosData.paymentUrl) {
          window.location.assign(payosData.paymentUrl);
          return;
        }
      }

      // If COD, go to orders page directly
      router.push('/orders?status=success');
    } catch {
      setError('Đã xảy ra lỗi hệ thống');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-neutral-500 font-medium">Đang chuẩn bị trang thanh toán...</div>;
  }

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <h1 className="text-3xl font-black text-white tracking-tight mb-8">Thanh Toán Đơn Hàng</h1>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Customer Information & Shipping */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-400" /> Thông Tin Nhận Hàng
            </h3>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                Họ và Tên Người Nhận *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                  Số Điện Thoại *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901234567"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                  Chọn Mã Giảm Giá (Voucher)
                </label>
                <div className="flex gap-2">
                  <select
                    value={voucherCode}
                    onChange={(e) => {
                      const selected = e.target.value;
                      setVoucherCode(selected);
                      if (!selected) handleRemoveVoucher();
                    }}
                    className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500 font-medium cursor-pointer"
                  >
                    <option value="" className="bg-neutral-900 text-neutral-300">-- Không dùng mã giảm giá --</option>
                    {availableVouchers.map((v) => (
                      <option key={v.id || v._id} value={v.code} className="bg-neutral-900 text-white font-medium">
                        🏷️ {v.code} - Giảm {v.discount_percent}% (Đơn từ {Number(v.min_order_value || 0).toLocaleString('vi-VN')}đ)
                      </option>
                    ))}
                  </select>

                  {appliedVoucher && (
                    <button
                      type="button"
                      onClick={handleRemoveVoucher}
                      className="px-3.5 py-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold rounded-xl text-sm transition-colors flex items-center gap-1"
                      title="Bỏ chọn mã"
                    >
                      <X className="w-4 h-4" /> Hủy
                    </button>
                  )}
                </div>

                {voucherError && (
                  <p className="text-xs text-rose-400 mt-1.5 font-medium">{voucherError}</p>
                )}
                {voucherSuccess && (
                  <p className="text-xs text-emerald-400 mt-1.5 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {voucherSuccess}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                Địa Chỉ Giao Hàng Chi Tiết *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                Ghi Chú Đơn Hàng (Tùy chọn)
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Giao ngoài giờ hành chính, gọi trước khi giao..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Payment Options */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-400" /> Phương Thức Thanh Toán
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'bg-amber-500/10 border-amber-500 text-white'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="accent-amber-500"
                />
                <div>
                  <span className="font-bold block text-sm">Thanh Toán Khi Nhận Hàng (COD)</span>
                  <span className="text-xs text-neutral-400">Trả tiền mặt cho Shipper khi giao đến nơi</span>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'PayOS'
                    ? 'bg-amber-500/10 border-amber-500 text-white'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="PayOS"
                  checked={paymentMethod === 'PayOS'}
                  onChange={() => setPaymentMethod('PayOS')}
                  className="accent-amber-500"
                />
                <div>
                  <span className="font-bold flex items-center gap-1.5 text-sm text-amber-400">
                    <QrCode className="w-4 h-4" /> Cổng Thanh Toán PayOS (VietQR)
                  </span>
                  <span className="text-xs text-neutral-400">Quét mã QR VietQR tự động qua App Ngân Hàng</span>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Order Summary & Submit Button */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 h-fit space-y-6">
          <h3 className="text-lg font-black text-white border-b border-neutral-800 pb-4">
            Đơn Hàng ({cartItems.length} sản phẩm)
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {cartItems.map((item) => (
              <div key={item.id || item._id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 max-w-[200px]">
                  <span className="font-bold text-amber-400">{item.amount}x</span>
                  <span className="truncate text-neutral-200">{item.product_id?.name}</span>
                </div>
                <span className="font-bold text-white">
                  {((item.product_id?.price || 0) * item.amount).toLocaleString('vi-VN')}đ
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-neutral-800 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-neutral-400">
              <span>Tạm tính:</span>
              <span className="font-bold text-white">{subtotal.toLocaleString('vi-VN')}đ</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400 font-medium">
                <span className="flex items-center gap-1">
                  <Tag className="w-4 h-4" /> Giảm giá ({appliedVoucher?.code}):
                </span>
                <span className="font-bold">-{discountAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            )}

            <div className="flex justify-between text-neutral-400">
              <span>Thuế VAT (10%):</span>
              <span className="font-bold text-white">+{vatAmount.toLocaleString('vi-VN')}đ</span>
            </div>

            <div className="flex justify-between text-lg font-black text-white border-t border-neutral-800 pt-3">
              <span>Tổng Tiền Đặt Hàng:</span>
              <span className="text-amber-400">{finalTotal.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all shadow-xl shadow-amber-500/20 text-base flex items-center justify-center gap-2"
          >
            {submitting ? 'Đang Xử Lý Đơn Hàng...' : 'Xác Nhận Đặt Hàng Ngay'}
          </button>
        </div>

      </form>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      <Header />
      <Suspense fallback={<div className="text-center py-20 text-neutral-500">Đang tải...</div>}>
        <CheckoutContent />
      </Suspense>
      <Footer />
    </div>
  );
}
