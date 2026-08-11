'use client';

import { useState, useEffect } from 'react';
import { FolderTree, Plus } from 'lucide-react';

interface CategoryType {
  id?: string;
  _id?: string;
  cname: string;
  manufacturer?: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [cname, setCname] = useState('');
  const [manufacturer, setManufacturer] = useState('Ray-Ban');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.categories || []);
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
        fetchCategories();
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
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cname, manufacturer }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Thêm danh mục kính thành công! 📁');
        setCname('');
        fetchCategories();
      } else {
        alert(data.error || 'Không thể thêm danh mục');
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
        <h1 className="text-3xl font-black text-white tracking-tight">Quản Lý Danh Mục Kính Mắt</h1>
        <p className="text-sm text-neutral-400 mt-1">Phân loại các hãng sản xuất và bộ sưu tập kính mắt & kính râm</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 h-fit space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Plus className="w-5 h-5 text-amber-400" /> Thêm Danh Mục Mới
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Tên Danh Mục *</label>
              <input
                type="text"
                required
                placeholder="VD: Kính Râm Hàng Hiệu"
                value={cname}
                onChange={(e) => setCname(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Nhà Sản Xuất / Hãng</label>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="VD: Ray-Ban / Gentle Monster"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg text-sm"
            >
              {submitting ? 'Đang Lưu...' : 'Thêm Danh Mục'}
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
            <FolderTree className="w-5 h-5 text-amber-400" /> Danh Sách Danh Mục Kính Mắt
          </h3>

          {loading ? (
            <div className="text-neutral-500 font-medium">Đang tải danh mục...</div>
          ) : categories.length === 0 ? (
            <p className="text-neutral-500 text-sm">Chưa có danh mục nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead className="text-xs text-neutral-400 uppercase bg-neutral-950/60 border-b border-neutral-800 whitespace-nowrap">
                  <tr>
                    <th className="p-3">Tên Danh Mục</th>
                    <th className="p-3">Nhà Sản Xuất</th>
                    <th className="p-3">Mã ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {categories.map((c, idx) => {
                    const catId = c.id || c._id || `cat-row-${idx}`;
                    return (
                      <tr key={catId} className="hover:bg-neutral-850 transition-colors">
                        <td className="p-3 font-bold text-white whitespace-nowrap">{c.cname}</td>
                        <td className="p-3 text-amber-400 font-semibold whitespace-nowrap">{c.manufacturer || 'N/A'}</td>
                        <td className="p-3 font-mono text-xs text-neutral-500 whitespace-nowrap">{catId}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
