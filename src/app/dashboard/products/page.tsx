'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Upload, Image as ImageIcon, Check } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    image: '',
    price: 0,
    title: '',
    description: '',
    cateID: '',
    quantity: 10,
    manufacturer: 'Ray-Ban',
    frame_shape: 'Mắt Vuông (Square)',
  });

  const fetchProductsAndCategories = async () => {
    setLoading(true);
    try {
      const [resP, resC] = await Promise.all([
        fetch('/api/products?limit=100'),
        fetch('/api/categories'),
      ]);
      const dataP = await resP.json();
      const dataC = await resC.json();
      if (dataP.success) setProducts(dataP.products || []);
      if (dataC.success) setCategories(dataC.categories || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      image: '',
      price: 3500000,
      title: '',
      description: '',
      cateID: categories[0]?.id || categories[0]?._id || '',
      quantity: 30,
      manufacturer: 'Ray-Ban',
      frame_shape: 'Mắt Vuông (Square)',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: any) => {
    setEditingId(product.id || product._id);
    setFormData({
      name: product.name || '',
      image: product.image || '',
      price: product.price || 0,
      title: product.title || '',
      description: product.description || '',
      cateID: product.cate_id || product.cateID?.id || product.cateID?._id || product.cateID || '',
      quantity: product.quantity || 0,
      manufacturer: product.manufacturer || 'Ray-Ban',
      frame_shape: product.frame_shape || 'Mắt Vuông (Square)',
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setFormData((prev) => ({ ...prev, image: data.url }));
      } else {
        alert(data.error || 'Lỗi tải ảnh lên');
      }
    } catch (err: any) {
      alert('Lỗi tải ảnh: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa kính này khỏi danh mục?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchProductsAndCategories();
      } else {
        alert(data.error || 'Không thể xóa sản phẩm');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      alert('Vui lòng chọn tải ảnh lên hoặc nhập link ảnh!');
      return;
    }
    try {
      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchProductsAndCategories();
      } else {
        alert(data.error || 'Lỗi lưu sản phẩm kính');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Quản Lý Sản Phẩm Kính Mắt</h1>
          <p className="text-sm text-neutral-400 mt-1">Thêm mới, tải ảnh trực tiếp, chỉnh sửa thông tin giá và tồn kho sản phẩm</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Thêm Mẫu Kính Mới
        </button>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="text-neutral-500 font-medium">Đang tải sản phẩm...</div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-neutral-400 uppercase bg-neutral-950/60 border-b border-neutral-800">
              <tr>
                <th className="p-3">Hình Ảnh</th>
                <th className="p-3">Tên Kính Mắt</th>
                <th className="p-3">Thương Hiệu</th>
                <th className="p-3">Kiểu Dáng Mắt</th>
                <th className="p-3">Giá Bán</th>
                <th className="p-3">Tồn Kho</th>
                <th className="p-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {products.map((p) => (
                <tr key={p.id || p._id} className="hover:bg-neutral-850">
                  <td className="p-3">
                    <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-xl bg-neutral-800 border border-neutral-700" />
                  </td>
                  <td className="p-3 font-bold text-white max-w-xs truncate">{p.name}</td>
                  <td className="p-3 text-amber-400 font-semibold">{p.manufacturer || 'Ray-Ban'}</td>
                  <td className="p-3 text-indigo-300 font-medium text-xs">{p.frame_shape || 'Thời trang'}</td>
                  <td className="p-3 font-black text-white">{Number(p.price).toLocaleString('vi-VN')}đ</td>
                  <td className="p-3 font-bold text-emerald-400">{p.quantity} chiếc</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id || p._id)}
                        className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-rose-400"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-lg text-white">
                {editingId ? 'Chỉnh Sửa Sản Phẩm Kính' : 'Thêm Mẫu Kính Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Tên Kính Mắt *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Kính Râm Ray-Ban Aviator Classic Gold"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none"
                />
              </div>

              {/* Upload Image Section */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-300 uppercase">Hình Ảnh Sản Phẩm *</label>
                
                <div className="flex items-center gap-4">
                  {/* Image Preview Box */}
                  <div className="w-20 h-20 rounded-2xl bg-neutral-800 border border-neutral-700 overflow-hidden flex items-center justify-center relative shrink-0">
                    {formData.image ? (
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-neutral-600" />
                    )}
                  </div>

                  {/* File Upload Button */}
                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer transition-all shadow">
                      <Upload className="w-4 h-4" />
                      {uploading ? 'Đang Tải Ảnh...' : 'Tải Ảnh Từ Máy Tính'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-neutral-400">Hỗ trợ định dạng PNG, JPG, WEBP hoặc GIF</p>
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-[11px] text-neutral-500 block mb-1">Hoặc dán Link URL ảnh:</span>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Giá Bán (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Số Lượng Tồn Kho *</label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Thương Hiệu</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="Ray-Ban, Gentle Monster..."
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Kiểu Dáng Mắt</label>
                  <select
                    value={formData.frame_shape}
                    onChange={(e) => setFormData({ ...formData, frame_shape: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Mắt Phi Công (Aviator)">Mắt Phi Công (Aviator)</option>
                    <option value="Mắt Vuông (Square)">Mắt Vuông (Square)</option>
                    <option value="Mắt Tròn (Round)">Mắt Tròn (Round)</option>
                    <option value="Mắt Mèo (Cat-Eye)">Mắt Mèo (Cat-Eye)</option>
                    <option value="Gọng Chữ Nhật (Rectangle)">Gọng Chữ Nhật (Rectangle)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Danh Mục</label>
                <select
                  value={formData.cateID}
                  onChange={(e) => setFormData({ ...formData, cateID: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id || c._id} value={c.id || c._id}>
                      {c.cname}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Mô Tả Sản Phẩm</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả thông số tròng kính, chất liệu gọng..."
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg text-sm"
              >
                {editingId ? 'Lưu Cập Nhật' : 'Tạo Sản Phẩm Mới'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
