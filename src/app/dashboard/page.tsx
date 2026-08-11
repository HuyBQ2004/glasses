'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, DollarSign, Package, Users } from 'lucide-react';

interface StatsType {
  totalRevenue?: number;
  totalOrders?: number;
  totalProducts?: number;
  totalUsers?: number;
}

interface RecentOrderType {
  _id: string;
  totalPrice: number;
  payment_method: string;
  payment_status?: string;
  account_id?: {
    fullname?: string;
    username?: string;
  };
  shipping_id?: {
    status?: string;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsType | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrderType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      fetch('/api/statistics')
        .then(res => res.json())
        .then(data => {
          if (isMounted && data.success) {
            setStats(data.stats);
            setRecentOrders(data.recentOrders || []);
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className="text-neutral-500 font-medium">Đang tải dữ liệu thống kê...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Tổng Quan Hệ Thống</h1>
        <p className="text-sm text-neutral-400 mt-1">Báo cáo doanh thu, đơn hàng và số liệu hoạt động</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-400 uppercase">Tổng Doanh Thu</span>
            <DollarSign className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">
            {Number(stats?.totalRevenue || 0).toLocaleString('vi-VN')}đ
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-400 uppercase">Tổng Đơn Hàng</span>
            <ShoppingBag className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats?.totalOrders || 0}</p>
        </div>

        <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-400 uppercase">Sản Phẩm Giày</span>
            <Package className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats?.totalProducts || 0}</p>
        </div>

        <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-400 uppercase">Khách Hàng</span>
            <Users className="w-5 h-5 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats?.totalUsers || 0}</p>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">Đơn Hàng Gần Đây</h3>

        {recentOrders.length === 0 ? (
          <p className="text-neutral-500 text-sm">Chưa có đơn hàng nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-neutral-400 uppercase bg-neutral-950/60 border-b border-neutral-800">
                <tr>
                  <th className="p-3">Mã Đơn</th>
                  <th className="p-3">Khách Hàng</th>
                  <th className="p-3">Tổng Tiền</th>
                  <th className="p-3">Phương Thức</th>
                  <th className="p-3">Trạng Thái Vận Chuyển</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {recentOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-neutral-850">
                    <td className="p-3 font-mono font-bold text-amber-400">#{ord._id.slice(-6)}</td>
                    <td className="p-3 font-semibold text-white">{ord.account_id?.fullname || ord.account_id?.username || 'Khách hàng'}</td>
                    <td className="p-3 font-black text-white">{Number(ord.totalPrice).toLocaleString('vi-VN')}đ</td>
                    <td className="p-3 text-neutral-300">{ord.payment_method} ({ord.payment_status || 'Pending'})</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full bg-neutral-800 text-amber-400 font-bold text-xs border border-neutral-700">
                        {ord.shipping_id?.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
