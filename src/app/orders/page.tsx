'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';

function OrdersContent() {
  const searchParams = useSearchParams();
  const statusMsg = searchParams.get('status');

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.orders || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {statusMsg === 'success' && (
        <div className="mb-8 p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-4">
          <CheckCircle className="w-8 h-8 shrink-0" />
          <div>
            <h3 className="font-bold text-lg text-white">Cảm ơn bạn đã đặt hàng! 🎉</h3>
            <p className="text-sm">Đơn hàng của bạn đã được ghi nhận và đang gửi đến đơn vị vận chuyển.</p>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-black text-white tracking-tight mb-8">Lịch Sử Đặt Hàng Của Bạn</h1>

      {loading ? (
        <div className="text-center py-20 text-neutral-500 font-medium">Đang tải lịch sử đơn hàng...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-neutral-900/50 rounded-3xl border border-neutral-800 space-y-3">
          <Package className="w-16 h-16 text-neutral-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">Bạn chưa có đơn hàng nào</h3>
          <p className="text-neutral-400 text-sm">Tất cả đơn hàng của bạn sẽ hiển thị chi tiết tại đây.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const ship = order.shipping_id || {};
            const statusColor = ship.status === 'Delivered'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : ship.status === 'Shipping'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400';

            return (
              <div
                key={order._id}
                className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4 hover:border-neutral-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-400">Đơn hàng #{order._id}</span>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Ngày đặt: {new Date(order.create_date || order.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full border text-xs font-bold ${statusColor}`}>
                      Trạng thái: {ship.status || 'Pending'}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700 text-xs font-bold">
                      Thanh toán: {order.payment_method} ({order.payment_status || 'Pending'})
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-300">
                  <div>
                    <p className="font-bold text-white mb-1">📍 Địa chỉ nhận hàng:</p>
                    <p className="text-xs text-neutral-400">{ship.name} - {ship.phone}</p>
                    <p className="text-xs text-neutral-400">{ship.address}</p>
                  </div>

                  <div className="md:text-right">
                    <p className="text-xs text-neutral-500 uppercase font-semibold">Tổng Tiền Thanh Toán</p>
                    <p className="text-2xl font-black text-amber-400 mt-1">
                      {Number(order.totalPrice).toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>
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
      <Suspense fallback={<div className="text-center py-20 text-neutral-500">Đang tải...</div>}>
        <OrdersContent />
      </Suspense>
      <Footer />
    </div>
  );
}
