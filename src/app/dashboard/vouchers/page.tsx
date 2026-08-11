'use client';

import { useState, useEffect } from 'react';
import { Tag, Plus } from 'lucide-react';

interface VoucherType {
  id?: string;
  _id?: string;
  code: string;
  discount_percent: number;
  max_discount?: number;
  min_order_value?: number;
  expiry_date: string;
}

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<VoucherType[]>([]);
  const [loading, setLoading] = useState(true);

  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(20);
  const [maxDiscount, setMaxDiscount] = useState(500000);
  const [minOrderValue, setMinOrderValue] = useState(1000000);
  const [expiryDate, setExpiryDate] = useState('2026-12-31');
  const [submitting, setSubmitting] = useState(false);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vouchers');
      const data = await res.json();
      if (data.success) setVouchers(data.vouchers || []);
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
        fetchVouchers();
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          discount_percent: discountPercent,
          max_discount: maxDiscount,
          min_order_value: minOrderValue,
          expiry_date: expiryDate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Tạo voucher thành công! 🎉');
        setCode('');
        fetchVouchers();
      } else {
        alert(data.error || 'Lỗi tạo voucher');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Quản Lý Voucher Giảm Giá</h1>
        <p className="text-sm text-neutral-400 mt-1">Tạo mã khuyến mãi giảm giá theo % cho đơn hàng</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 h-fit space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Plus className="w-5 h-5 text-amber-400" /> Tạo Voucher Mới
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Mã Voucher (Code) *</label>
              <input
                type="text"
                required
                placeholder="VD: GIAM20"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-white uppercase font-mono font-bold focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">% Giảm Giá *</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Giảm Tối Đa (đ)</label>
                <input
                  type="number"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(Number(e.target.value))}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Giá Trị Đơn Tối Thiểu (đ)</label>
              <input
                type="number"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(Number(e.target.value))}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Ngày Hết Hạn *</label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg text-sm"
            >
              {submitting ? 'Đang Tạo...' : 'Tạo Voucher Khuyến Mãi'}
            </button>
          </form>
        </div>

        {/* Voucher List */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Tag className="w-5 h-5 text-amber-400" /> Danh Sách Voucher Khuyến Mãi
          </h3>

          {loading ? (
            <div className="text-neutral-500 font-medium">Đang tải voucher...</div>
          ) : vouchers.length === 0 ? (
            <p className="text-neutral-500 text-sm">Chưa có voucher nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="text-xs text-neutral-400 uppercase bg-neutral-950/60 border-b border-neutral-800 whitespace-nowrap">
                  <tr>
                    <th className="p-3">Mã Voucher</th>
                    <th className="p-3">% Giảm</th>
                    <th className="p-3">Giảm Tối Đa</th>
                    <th className="p-3">Đơn Tối Thiểu</th>
                    <th className="p-3">Hạn Sử Dụng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {vouchers.map((v) => (
                    <tr key={v.id || v._id} className="hover:bg-neutral-850 transition-colors">
                      <td className="p-3 font-mono font-bold text-amber-400 whitespace-nowrap">{v.code}</td>
                      <td className="p-3 font-bold text-white whitespace-nowrap">{v.discount_percent}%</td>
                      <td className="p-3 text-neutral-300 whitespace-nowrap">
                        {v.max_discount ? `${Number(v.max_discount).toLocaleString('vi-VN')}đ` : 'Không giới hạn'}
                      </td>
                      <td className="p-3 text-neutral-300 whitespace-nowrap">
                        {v.min_order_value ? `${Number(v.min_order_value).toLocaleString('vi-VN')}đ` : '0đ'}
                      </td>
                      <td className="p-3 text-neutral-400 text-xs whitespace-nowrap">
                        {new Date(v.expiry_date).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
