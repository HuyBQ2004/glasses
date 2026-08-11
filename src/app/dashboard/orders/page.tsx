'use client';

import { useState, useEffect } from 'react';
import { Eye, XCircle } from 'lucide-react';
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
  note?: string;
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
  items?: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleUpdateShippingStatus = async (shippingId: string, status: string) => {
    try {
      const res = await fetch(`/api/shipping/${shippingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Đã cập nhật trạng thái đơn hàng thành: ${status}`);
        fetchOrders();
        if (selectedOrder && (selectedOrder.shipping_id?.id === shippingId || selectedOrder.shipping_id?._id === shippingId)) {
          setSelectedOrder((prev) => (prev ? {
            ...prev,
            shipping_id: { ...prev.shipping_id, status },
          } : null));
        }
      } else {
        alert(data.error || 'Lỗi cập nhật trạng thái');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    const currentStatus = o.shipping_id?.status || 'Pending';
    return currentStatus.toLowerCase() === statusFilter.toLowerCase();
  });

  const totalRevenue = orders.reduce((sum, o) => {
    const pStatus = (o.payment_status || '').toLowerCase();
    const oStatus = (o.status || o.shipping_id?.status || '').toLowerCase();
    const isPaid = pStatus === 'paid' || oStatus === 'completed' || oStatus === 'delivered' || oStatus === 'da_giao' || pStatus === 'da_thanh_toan';
    return isPaid ? sum + (Number(o.total_price || o.totalPrice) || 0) : sum;
  }, 0);

  return (
    <div className="space-y-8">
      {/* Header & Quick Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Quản Lý Đơn Hàng Kính Mắt</h1>
          <p className="text-sm text-neutral-400 mt-1">Theo dõi, duyệt vận chuyển và cập nhật trạng thái đơn hàng</p>
        </div>

        <div className="flex items-center gap-4 bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
          <div>
            <span className="text-xs text-neutral-400 font-bold uppercase block">Tổng Doanh Thu Đơn Hàng</span>
            <span className="text-2xl font-black text-amber-400">{totalRevenue.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-850">
        {[
          { key: 'all', label: 'Tất Cả Đơn Hàng' },
          { key: 'Pending', label: 'Chờ Xử Lý (Pending)' },
          { key: 'Shipping', label: 'Đang Giao Hàng' },
          { key: 'Delivered', label: 'Đã Giao Thành Công' },
          { key: 'Cancelled', label: 'Đã Hủy' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === tab.key
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="text-neutral-500 font-medium py-10">Đang tải danh sách đơn hàng...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-neutral-900/40 rounded-3xl border border-neutral-800">
          <p className="text-neutral-400 font-semibold">Không tìm thấy đơn hàng nào trong mục này.</p>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl sm:rounded-3xl p-3 sm:p-6 overflow-x-auto shadow-xl">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="text-xs text-neutral-400 uppercase bg-neutral-950/60 border-b border-neutral-800 whitespace-nowrap">
              <tr>
                <th className="p-3">Mã Đơn Hàng</th>
                <th className="p-3">Khách Hàng</th>
                <th className="p-3">Số Điện Thoại</th>
                <th className="p-3">Tổng Thanh Toán</th>
                <th className="p-3">Thanh Toán</th>
                <th className="p-3">Trạng Thái Giao Hàng</th>
                <th className="p-3 text-right">Chi Tiết / Đổi Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredOrders.map((ord) => {
                const ordId = ord.id || ord._id || '';
                const shippingId = ord.shipping_id?.id || ord.shipping_id?._id || '';
                const status = ord.shipping_id?.status || 'Pending';
                const paymentStatus = ord.payment_status || 'Pending';

                return (
                  <tr key={ordId} className="hover:bg-neutral-850 transition-colors">
                    <td className="p-3 font-mono font-bold text-amber-400 whitespace-nowrap">#{ordId.slice(-6).toUpperCase()}</td>
                    <td className="p-3 font-semibold text-white whitespace-nowrap">
                      {ord.shipping_id?.name || ord.account?.fullname || ord.account?.username || 'Khách Hàng'}
                    </td>
                    <td className="p-3 text-neutral-300 font-mono whitespace-nowrap">{ord.shipping_id?.phone || ord.account?.phone || '---'}</td>
                    <td className="p-3 font-black text-white whitespace-nowrap">{Number(ord.total_price || ord.totalPrice).toLocaleString('vi-VN')}đ</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block ${
                        paymentStatus === 'Paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {ord.payment_method || 'COD'} ({paymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'})
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-block ${
                        status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        status === 'Shipping' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        status === 'Cancelled' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                        'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        {status === 'Delivered' ? '✅ Đã Giao' :
                         status === 'Shipping' ? '🚚 Đang Giao' :
                         status === 'Cancelled' ? '❌ Đã Hủy' : '⏳ Chờ Xử Lý'}
                      </span>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={status}
                          onChange={(e) => handleUpdateShippingStatus(shippingId, e.target.value)}
                          className="bg-neutral-800 border border-neutral-700 rounded-lg p-1.5 text-xs text-white focus:outline-none cursor-pointer"
                        >
                          <option value="Pending">Chờ Xử Lý</option>
                          <option value="Shipping">Đang Giao</option>
                          <option value="Delivered">Đã Giao</option>
                          <option value="Cancelled">Đã Hủy</option>
                        </select>

                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setIsModalOpen(true);
                          }}
                          className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400"
                          title="Xem chi tiết đơn hàng"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal View Order Details */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="font-bold text-lg text-white">
                  Chi Tiết Đơn Hàng #{selectedOrder.id?.slice(-6).toUpperCase() || selectedOrder._id?.slice(-6).toUpperCase()}
                </h3>
                <span className="text-xs text-neutral-400">
                  Ngày đặt: {new Date(selectedOrder.created_at || selectedOrder.create_date || 0).toLocaleString('vi-VN')}
                </span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Info */}
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-1 text-sm">
              <p className="text-amber-400 font-bold text-xs uppercase mb-2">Thông Tin Nhận Hàng</p>
              <p className="text-white font-bold">Người nhận: {selectedOrder.shipping_id?.name || selectedOrder.account?.fullname || 'Khách hàng'}</p>
              <p className="text-neutral-300">SĐT: {selectedOrder.shipping_id?.phone || selectedOrder.account?.phone}</p>
              <p className="text-neutral-300">Địa chỉ: {selectedOrder.shipping_id?.address || selectedOrder.account?.address}</p>
              {selectedOrder.note && <p className="text-neutral-400 text-xs italic">Ghi chú: {selectedOrder.note}</p>}
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <p className="text-amber-400 font-bold text-xs uppercase">Sản Phẩm Trong Đơn</p>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                    <div className="flex items-center gap-3">
                      {item.product_image && (
                        <Image src={item.product_image} alt={item.product_name || 'Product'} width={40} height={40} unoptimized className="w-10 h-10 object-cover rounded-lg bg-neutral-800" />
                      )}
                      <div>
                        <p className="font-bold text-white text-sm">{item.product_name}</p>
                        <p className="text-xs text-neutral-400">Số lượng: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-black text-amber-400 text-sm">
                      {Number((item.product_price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 text-xs italic">Không có dữ liệu chi tiết sản phẩm.</p>
              )}
            </div>

            {/* Total */}
            <div className="border-t border-neutral-800 pt-4 flex justify-between items-center text-base font-black">
              <span className="text-white">Tổng Tiền Đơn Hàng:</span>
              <span className="text-amber-400 text-xl">
                {Number(selectedOrder.total_price || selectedOrder.totalPrice).toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
