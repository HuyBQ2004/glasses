'use client';

import { useState, useEffect } from 'react';
import { Plus, History } from 'lucide-react';

interface ProductStockType {
  id?: string;
  _id?: string;
  name: string;
  quantity: number;
}

interface StockImportType {
  id?: string;
  _id?: string;
  import_quantity: number;
  note?: string;
  created_at?: string;
  createdAt?: string;
  product_id?: {
    name?: string;
  };
  created_by?: {
    fullname?: string;
  };
}

export default function StockImportPage() {
  const [products, setProducts] = useState<ProductStockType[]>([]);
  const [imports, setImports] = useState<StockImportType[]>([]);
  const [loading, setLoading] = useState(true);

  const [productId, setProductId] = useState('');
  const [importQuantity, setImportQuantity] = useState(10);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resP, resI] = await Promise.all([
        fetch('/api/products?limit=100'),
        fetch('/api/stock-import'),
      ]);
      const dataP = await resP.json();
      const dataI = await resI.json();

      if (dataP.success) {
        setProducts(dataP.products || []);
        if (dataP.products?.length > 0) setProductId(dataP.products[0]._id || dataP.products[0].id || '');
      }
      if (dataI.success) setImports(dataI.imports || []);
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
        fetchData();
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/stock-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, importQuantity, note }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Nhập kho thành công! Số lượng tồn kho đã được cộng thêm. 📦');
        setNote('');
        fetchData();
      } else {
        alert(data.error || 'Lỗi nhập kho');
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
        <h1 className="text-3xl font-black text-white tracking-tight">Quản Lý Nhập Kho (Warehouse Manager)</h1>
        <p className="text-sm text-neutral-400 mt-1">Cập nhật bổ sung số lượng sản phẩm và ghi nhận nhật ký nhập kho</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Import Form */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 h-fit space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Plus className="w-5 h-5 text-amber-400" /> Nhập Thêm Hàng Vào Kho
          </h3>

          <form onSubmit={handleImportSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Chọn Giày Nhập *</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none"
              >
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} (Tồn hiện tại: {p.quantity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Số Lượng Nhập Thêm *</label>
              <input
                type="number"
                min={1}
                required
                value={importQuantity}
                onChange={(e) => setImportQuantity(Number(e.target.value))}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Ghi Chú Nhập Kho</label>
              <textarea
                rows={2}
                placeholder="VD: Nhập đợt mới từ nhà máy Nike Việt Nam..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg text-sm"
            >
              {submitting ? 'Đang Nhập Kho...' : 'Xác Nhận Nhập Kho'}
            </button>
          </form>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
            <History className="w-5 h-5 text-amber-400" /> Nhật Ký Lịch Sử Nhập Kho
          </h3>

          {loading ? (
            <div className="text-neutral-500 font-medium">Đang tải lịch sử...</div>
          ) : imports.length === 0 ? (
            <p className="text-neutral-500 text-sm">Chưa có nhật ký nhập kho nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="text-xs text-neutral-400 uppercase bg-neutral-950/60 border-b border-neutral-800 whitespace-nowrap">
                  <tr>
                    <th className="p-3">Sản Phẩm</th>
                    <th className="p-3">Số Lượng Nhập</th>
                    <th className="p-3">Người Tạo</th>
                    <th className="p-3">Thời Gian</th>
                    <th className="p-3">Ghi Chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {imports.map((imp) => (
                    <tr key={imp.id || imp._id} className="hover:bg-neutral-850 transition-colors">
                      <td className="p-3 font-bold text-white max-w-xs truncate whitespace-nowrap">{imp.product_id?.name}</td>
                      <td className="p-3 font-black text-amber-400 whitespace-nowrap">+{imp.import_quantity} chiếc</td>
                      <td className="p-3 text-neutral-300 whitespace-nowrap">{imp.created_by?.fullname || 'Thủ Kho'}</td>
                      <td className="p-3 text-neutral-400 text-xs whitespace-nowrap">
                        {new Date(imp.created_at || imp.createdAt || 0).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-3 text-neutral-400 text-xs italic whitespace-nowrap">{imp.note || '---'}</td>
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
