'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface ShippingOrderType {
  id?: string;
  _id?: string;
  total_price?: number;
  totalPrice?: number;
  payment_method?: string;
  payment_status?: string;
  status?: string;
  shipping_id?: {
    id?: string;
    _id?: string;
    status?: string;
    name?: string;
    phone?: string;
    address?: string;
  };
  account?: {
    fullname?: string;
    username?: string;
    phone?: string;
    address?: string;
  };
}

export default function ShippingManagerPage() {
  const [orders, setOrders] = useState<ShippingOrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
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
        fetchOrders();
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdateStatus = async (shippingId: string, status: string) => {
    if (!shippingId) {
      alert('Không tìm thấy mã vận chuyển của đơn hàng này.');
      return;
    }

    try {
      const res = await fetch(`/api/shipping/${shippingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Đã cập nhật trạng thái vận chuyển: ${status}`);
        fetchOrders();
      } else {
        alert(data.error || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error(error);
      alert('Đã xảy ra lỗi khi kết nối máy chủ');
    }
  };

  const filteredOrders = orders.filter((ord) => {
    const ship = typeof ord.shipping_id === 'object' ? ord.shipping_id : {};
    const customerName = ship.name || ord.account?.fullname || ord.account?.username || '';
    const phone = ship.phone || ord.account?.phone || '';
    const orderId = ord.id || ord._id || '';

    const matchesSearch =
      orderId.toLowerCase().includes(search.toLowerCase()) ||
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      phone.includes(search);

    const currentStatus = ship.status || ord.status || 'Pending';
    const matchesFilter = filterStatus === 'all' || currentStatus.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Quản Lý Thanh Toán & Vận Chuyển</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Xác nhận thu tiền COD / PayOS và cập nhật trạng thái giao hàng cho từng đơn
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
        <div className="w-full sm:w-80 relative">
          <input
            type="text"
            placeholder="Tìm theo tên khách, SĐT, mã đơn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute right-3 top-3" />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'Pending', label: 'Chờ giao hàng' },
            { key: 'Shipping', label: 'Đang giao' },
            { key: 'Delivered', label: 'Đã giao (Thành công)' },
            { key: 'Cancelled', label: 'Đã hủy' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterStatus === tab.key
                  ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                  : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-neutral-500 font-medium py-12 text-center">Đang tải danh sách vận chuyển & thanh toán...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-neutral-900/40 rounded-3xl border border-neutral-800">
          <p className="text-neutral-400 font-semibold">Không tìm thấy đơn hàng vận chuyển nào phù hợp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((order) => {
            const ordId = order.id || order._id;
            const ship = typeof order.shipping_id === 'object' ? order.shipping_id : {};
            const shippingId = ship.id || ship._id || (typeof order.shipping_id === 'string' ? order.shipping_id : ordId);
            
            const currentStatus = ship.status || order.status || 'Pending';
            const paymentMethod = order.payment_method || 'COD';
            const paymentStatus = (order.payment_status || '').toLowerCase();
            const isPaid = paymentStatus === 'paid' || paymentStatus === 'da_thanh_toan' || currentStatus === 'Delivered';

            return (
              <div key={ordId} className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-neutral-750 transition-all space-y-4 shadow-xl">
                
                {/* Header info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-amber-400 text-base">Mã đơn: #{ordId.slice(-6).toUpperCase()}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                        isPaid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {paymentMethod} ({isPaid ? 'Đã thanh toán (Tính doanh thu)' : 'Chưa thanh toán'})
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300">
                      Khách hàng: <strong className="text-white font-bold">{ship.name || order.account?.fullname || 'Khách hàng'}</strong> ({ship.phone || order.account?.phone || 'Chưa cập nhật SĐT'})
                    </p>
                    <p className="text-xs text-neutral-400">
                      Địa chỉ nhận hàng: <span className="text-neutral-200">{ship.address || order.account?.address || '---'}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-neutral-400 block font-semibold">Tổng Tiền Đơn Hàng</span>
                    <span className="text-2xl font-black text-white">
                      {Number(order.total_price || order.totalPrice || 0).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>

                {/* Status and Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400 font-semibold">Trạng thái vận chuyển:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                      currentStatus === 'Delivered' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      currentStatus === 'Shipping' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      currentStatus === 'Cancelled' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                      'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>
                      {currentStatus === 'Delivered' ? '✅ Đã Giao Hàng Thành Công' :
                       currentStatus === 'Shipping' ? '🚚 Đang Trên Đường Giao' :
                       currentStatus === 'Cancelled' ? '❌ Đã Hủy Đơn Hàng' : '⏳ Chờ Xử Lý Giao Hàng'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus(shippingId, 'Shipping')}
                      className="px-4 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition-all"
                    >
                      🚚 Chuyển Đang Giao
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(shippingId, 'Delivered')}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-black transition-all shadow-md shadow-emerald-500/20"
                    >
                      ✅ Giao Thành Công & Xác Nhận Thu Tiền
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(shippingId, 'Cancelled')}
                      className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all"
                    >
                      ❌ Hủy Đơn Hàng
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
