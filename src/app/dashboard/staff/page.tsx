'use client';

import { useState, useEffect } from 'react';
import { Users, Shield, Lock, Unlock } from 'lucide-react';

export default function AdminStaffPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/staff');
      const data = await res.json();
      if (data.success) setAccounts(data.accounts || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleUpdateRole = async (id: string, role: string, active: boolean) => {
    try {
      const res = await fetch('/api/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role, active }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Cập nhật phân quyền tài khoản thành công! 🔑');
        fetchAccounts();
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
        <h1 className="text-3xl font-black text-white tracking-tight">Quản Lý Nhân Viên & Phân Quyền (Roles)</h1>
        <p className="text-sm text-neutral-400 mt-1">Cấp quyền truy cập cho Admin (Quản trị hệ thống), Owner (Chủ cửa hàng) và Khách hàng</p>
      </div>

      {loading ? (
        <div className="text-neutral-500 font-medium">Đang tải danh sách tài khoản...</div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-neutral-400 uppercase bg-neutral-950/60 border-b border-neutral-800">
              <tr>
                <th className="p-3">Tài Khoản</th>
                <th className="p-3">Họ và Tên</th>
                <th className="p-3">Email / SĐT</th>
                <th className="p-3">Quyền Hạn (Role)</th>
                <th className="p-3">Trạng Thái</th>
                <th className="p-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {accounts.map((acc) => (
                <tr key={acc._id} className="hover:bg-neutral-850">
                  <td className="p-3 font-bold text-amber-400 font-mono">{acc.username}</td>
                  <td className="p-3 font-semibold text-white">{acc.fullname || 'Chưa cập nhật'}</td>
                  <td className="p-3 text-neutral-400 text-xs">
                    {acc.email || 'N/A'} <br /> {acc.phone}
                  </td>
                  <td className="p-3">
                    <select
                      value={acc.role}
                      onChange={(e) => handleUpdateRole(acc._id, e.target.value, acc.active)}
                      className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs font-bold text-amber-400 cursor-pointer focus:outline-none"
                    >
                      <option value="admin">admin (Quản trị hệ thống)</option>
                      <option value="owner">owner (Chủ cửa hàng)</option>
                      <option value="customer">customer (Khách hàng)</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${acc.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
                      {acc.active ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleUpdateRole(acc._id, acc.role, !acc.active)}
                      className={`p-2 rounded-xl border text-xs font-bold ${acc.active ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'}`}
                      title={acc.active ? 'Khóa tài khoản' : 'Mở khóa'}
                    >
                      {acc.active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
