'use client';

import { useState, useEffect } from 'react';
import { Truck, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function ShippingManagerPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) setOrders(data.orders || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (shippingId: string, status: string) => {
    try {
      const res = await fetch(`/api/shipping/${shippingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
      } else {
        alert(data.error || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Quản Lý Giao Hàng (Shipper Dashboard)</h1>
        <p className="text-sm text-neutral-400 mt-1">Cập nhật trạng thái vận chuyển và thu tiền đơn hàng COD</p>
      </div>

      {loading ? (
        <div className="text-neutral-500 font-medium">Đang tải danh sách vận chuyển...</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const ship = order.shipping_id || {};
            return (
              <div key={order._id} className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                  <div>
                    <span className="font-mono font-bold text-amber-400 text-sm">Đơn hàng #{order._id}</span>
                    <p className="text-xs text-neutral-400 mt-1">
                      Khách hàng: <strong className="text-white">{ship.name}</strong> ({ship.phone})
                    </p>
                    <p className="text-xs text-neutral-400">Địa chỉ: {ship.address}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-neutral-500 block">Tổng tiền</span>
                    <span className="text-xl font-black text-white">
                      {Number(order.totalPrice).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400">Trạng thái hiện tại:</span>
                    <span className="px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-amber-400 font-bold text-xs">
                      {ship.status || 'Pending'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus(ship._id, 'Shipping')}
                      className="px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 text-xs font-bold"
                    >
                      Đang Giao Hàng
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(ship._id, 'Delivered')}
                      className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-bold"
                    >
                      Đã Giao Thành Công
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(ship._id, 'Cancelled')}
                      className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 text-xs font-bold"
                    >
                      Hủy Đơn Hàng
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
