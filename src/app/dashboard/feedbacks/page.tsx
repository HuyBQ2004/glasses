'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Star, Eye, EyeOff } from 'lucide-react';

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/feedbacks');
      const data = await res.json();
      if (data.success) setFeedbacks(data.feedbacks || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Quản Lý Feedback & Nhận Xét Khách Hàng</h1>
        <p className="text-sm text-neutral-400 mt-1">Tổng hợp và quản lý đánh giá sao của người dùng về sản phẩm</p>
      </div>

      {loading ? (
        <div className="text-neutral-500 font-medium">Đang tải danh sách feedback...</div>
      ) : feedbacks.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-12 text-center text-neutral-500">
          Chưa có đánh giá feedback nào từ khách hàng.
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((fb) => (
            <div key={fb._id} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
                    {(fb.account_id?.username || 'U').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">
                      {fb.account_id?.fullname || fb.account_id?.username || 'Khách hàng'}
                    </h4>
                    <p className="text-xs text-neutral-400">
                      Đánh giá cho sản phẩm: <strong className="text-amber-400">{fb.product_id?.name}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(fb.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
              </div>

              <p className="text-sm text-neutral-300 bg-neutral-950/60 p-4 rounded-2xl border border-neutral-850">
                "{fb.content || 'Không có nhận xét chi tiết'}"
              </p>

              <div className="text-xs text-neutral-500">
                Ngày gửi: {new Date(fb.create_date || fb.createdAt).toLocaleDateString('vi-VN')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
