'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Package, CheckCircle, ShoppingBag, ArrowRight, CreditCard, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface OrderItem {
  product_name?: string;
  product_image?: string;
  product_price?: number;
  quantity?: number;
}

interface OrderType {
  id?: string;
  _id?: string;
  total_price?: number;
  totalPrice?: number;
  payment_status?: string;
  payment_method?: string;
  created_at?: string;
  create_date?: string;
  status?: string;
  shipping_id?: {
    status?: string;
    name?: string;
    phone?: string;
    address?: string;
  };
  account?: {
    fullname?: string;
    phone?: string;
    address?: string;
  };
  items?: OrderItem[];
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const statusMsg = searchParams.get('status');
  const cancelledOrderId = searchParams.get('orderId');

  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrders(data.orders || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRePayPayOS = async (orderId: string, amount: number) => {
    setPayingOrderId(orderId);
    try {
      const res = await fetch('/api/payos/create-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount }),
      });
      const data = await res.json();
      if (data.success && data.paymentUrl) {
        window.location.assign(data.paymentUrl);
      } else {
        alert(data.error || 'Không thể tạo liên kết thanh toán PayOS. Vui lòng thử lại!');
        setPayingOrderId(null);
      }
    } catch {
      alert('Lỗi kết nối khi tạo liên kết thanh toán');
      setPayingOrderId(null);
    }
  };

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {statusMsg === 'success' && (
        <div className="mb-8 p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-4 shadow-xl">
          <CheckCircle className="w-8 h-8 shrink-0" />
          <div>
            <h3 className="font-bold text-lg text-white">Cảm ơn bạn đã thanh toán / đặt hàng! 🎉</h3>
            <p className="text-sm text-emerald-300/90">
              Đơn hàng của bạn đã được khởi tạo/thanh toán thành công và đang chuyển sang bộ phận đóng gói giao hàng.
            </p>
          </div>
        </div>
      )}

      {statusMsg === 'cancelled' && (
        <div className="mb-8 p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-4 shadow-xl">
          <AlertCircle className="w-8 h-8 shrink-0 text-amber-400 mt-0.5" />
          <div>
            <h3 className="font-bold text-lg text-white">Bạn đã hủy hoặc chưa hoàn tất thanh toán qua PayOS</h3>
            <p className="text-sm text-neutral-300 mt-1 leading-relaxed">
              Đơn hàng {cancelledOrderId ? `#${cancelledOrderId.slice(-6).toUpperCase()}` : ''} của bạn vẫn được lưu giữ an toàn. Bạn có thể nhấn nút <strong className="text-amber-400">&quot;Thanh Toán Lại PayOS (VietQR)&quot;</strong> bên dưới đơn hàng bất kỳ lúc nào để tiếp tục thanh toán!
            </p>
          </div>
        </div>
      )}

      <div className="mb-8 border-b border-neutral-850 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">Lịch Sử Đặt Hàng Của Bạn</h1>
        <p className="text-neutral-400 text-sm mt-1">Theo dõi tiến độ giao hàng và thông tin các đơn hàng đã mua</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-neutral-500 font-medium">Đang tải danh sách lịch sử đơn hàng...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-neutral-900/50 rounded-3xl border border-neutral-800 space-y-4 max-w-lg mx-auto p-8 shadow-2xl">
          <Package className="w-16 h-16 text-amber-500/60 mx-auto" />
          <h3 className="text-xl font-bold text-white">Bạn chưa có đơn hàng kính mắt nào</h3>
          <p className="text-neutral-400 text-sm">
            Hãy khám phá bộ sưu tập kính râm và gọng kính chính hãng ngay để trải nghiệm mua sắm đẳng cấp!
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 mt-2"
          >
            <ShoppingBag className="w-4 h-4" /> Khám Phá Kính Mắt Ngay <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, idx) => {
            const ordId = order.id || order._id || `order-${idx}`;
            const ship = typeof order.shipping_id === 'object' ? order.shipping_id : {};
            const status = ship.status || order.status || 'Pending';
            const paymentStatus = (order.payment_status || 'Pending').toLowerCase();
            const totalPrice = Number(order.total_price || order.totalPrice || 0);

            const statusBadge =
              status === 'Delivered'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : status === 'Shipping'
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                : status === 'Cancelled'
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30';

            const statusText =
              status === 'Delivered'
                ? '✅ Đã Giao Thành Công'
                : status === 'Shipping'
                ? '🚚 Đang Trên Đường Giao'
                : status === 'Cancelled'
                ? '❌ Đã Hủy Đơn'
                : '⏳ Đang Chờ Xử Lý';

            const isPaid = paymentStatus === 'paid' || paymentStatus === 'da_thanh_toan' || status === 'Delivered';

            return (
              <div
                key={ordId}
                className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-5 hover:border-neutral-750 transition-all shadow-xl"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-neutral-800 pb-4">
                  <div>
                    <span className="text-xs sm:text-sm font-mono font-black text-amber-400">
                      Mã Đơn: #{ordId.slice(-6).toUpperCase()}
                    </span>
                    <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">
                      Ngày đặt:{' '}
                      {new Date(order.created_at || order.create_date || 0).toLocaleString('vi-VN')}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full border text-[11px] sm:text-xs font-bold ${statusBadge}`}>
                      {statusText}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full border text-[11px] sm:text-xs font-bold ${
                        isPaid
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                      }`}
                    >
                      Thanh toán: {order.payment_method || 'COD'} ({isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'})
                    </span>
                  </div>
                </div>

                {/* Items List (if detailed items present) */}
                {order.items && order.items.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Danh Sách Kính Đã Đặt</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-950 border border-neutral-850">
                          {item.product_image && (
                            <Image
                              src={item.product_image}
                              alt={item.product_name || 'Product'}
                              width={48}
                              height={48}
                              unoptimized
                              className="w-12 h-12 object-cover rounded-xl bg-neutral-800 shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white text-xs sm:text-sm truncate">{item.product_name}</p>
                            <p className="text-xs text-neutral-400">Số lượng: {item.quantity}</p>
                          </div>
                          <span className="font-black text-amber-400 text-xs sm:text-sm shrink-0">
                            {Number((item.product_price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shipping Address & Total Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-2 border-t border-neutral-800/80">
                  <div>
                    <p className="font-bold text-amber-400 text-xs uppercase mb-1">📍 Địa chỉ nhận hàng</p>
                    <p className="text-white font-semibold">{ship.name || order.account?.fullname || 'Khách hàng'}</p>
                    <p className="text-xs text-neutral-300">SĐT: {ship.phone || order.account?.phone || 'Chưa có SĐT'}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{ship.address || order.account?.address || 'Chưa có địa chỉ'}</p>
                  </div>

                  <div className="md:text-right flex flex-col justify-center">
                    <span className="text-xs text-neutral-400 font-semibold uppercase">Tổng Giá Trị Đơn Hàng</span>
                    <span className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">
                      {totalPrice.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>

                {/* PayOS Retry Payment Action */}
                {order.payment_method === 'PayOS' && !isPaid && status !== 'Cancelled' && (
                  <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between flex-wrap gap-3 bg-amber-500/5 p-3.5 rounded-2xl border border-amber-500/20">
                    <span className="text-xs text-amber-300 font-medium flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      Đơn hàng này chưa hoàn tất thanh toán qua PayOS.
                    </span>
                    <button
                      onClick={() => handleRePayPayOS(ordId, totalPrice)}
                      disabled={payingOrderId === ordId}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs shadow-md transition-all flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      {payingOrderId === ordId ? 'Đang Khởi Tạo PayOS...' : 'Thanh Toán Lại PayOS (VietQR)'}
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      <Header />
      <Suspense fallback={<div className="text-center py-20 text-neutral-500 font-medium">Đang tải...</div>}>
        <OrdersContent />
      </Suspense>
      <Footer />
    </div>
  );
}
