import Link from 'next/link';
import { ShieldCheck, Truck, RotateCcw, Headphones, Eye } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-400 border-t border-neutral-800 pt-12 pb-8">
      {/* Service Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-neutral-900">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800/80">
          <Truck className="w-8 h-8 text-amber-500 shrink-0" />
          <div>
            <h4 className="text-white font-semibold text-sm">Giao Hàng Toàn Quốc</h4>
            <p className="text-xs text-neutral-500">Miễn phí ship cho đơn từ 1tr</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800/80">
          <ShieldCheck className="w-8 h-8 text-amber-500 shrink-0" />
          <div>
            <h4 className="text-white font-semibold text-sm">Chính Hãng 100%</h4>
            <p className="text-xs text-neutral-500">Cam kết hoàn tiền x2 nếu giả</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800/80">
          <RotateCcw className="w-8 h-8 text-amber-500 shrink-0" />
          <div>
            <h4 className="text-white font-semibold text-sm">Đổi Trả 7 Ngày</h4>
            <p className="text-xs text-neutral-500">Miễn phí đổi gọng nếu không vừa</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800/80">
          <Headphones className="w-8 h-8 text-amber-500 shrink-0" />
          <div>
            <h4 className="text-white font-semibold text-sm">Tư Vấn Khám Mắt</h4>
            <p className="text-xs text-neutral-500">Tư vấn tròng kính chuẩn y khoa</p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold text-white mb-4">GLASSVAULT 2026</h3>
          <p className="text-sm text-neutral-400 mb-4 leading-relaxed">
            Hệ thống phân phối kính mắt & kính râm hàng hiệu chính hãng hàng đầu Việt Nam (Ray-Ban, Gentle Monster, Oakley, Gucci, Tom Ford).
          </p>
          <p className="text-xs text-neutral-500">
            📍 Địa chỉ: 123 Đường Cầu Giấy, Hà Nội<br />
            📞 Hotline / Zalo: 090.123.4567<br />
            ✉️ Email: support@glassvault.vn
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Thương Hiệu Kính</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/products?search=Ray-Ban" className="hover:text-amber-400">Ray-Ban Sunglasses</Link></li>
            <li><Link href="/products?search=Gentle+Monster" className="hover:text-amber-400">Gentle Monster Korea</Link></li>
            <li><Link href="/products?search=Oakley" className="hover:text-amber-400">Oakley Sport Eyewear</Link></li>
            <li><Link href="/products?search=Gucci" className="hover:text-amber-400">Gucci Luxury Frames</Link></li>
            <li><Link href="/products?search=Tom+Ford" className="hover:text-amber-400">Tom Ford Eyeglasses</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Hỗ Trợ Khách Hàng</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="#" className="hover:text-amber-400">Hướng dẫn chọn dáng mắt kính</Link></li>
            <li><Link href="#" className="hover:text-amber-400">Chính sách bảo hành tròng kính</Link></li>
            <li><Link href="#" className="hover:text-amber-400">Thanh toán VietQR PayOS</Link></li>
            <li><Link href="#" className="hover:text-amber-400">Điều khoản dịch vụ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Phương Thức Thanh Toán</h4>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-amber-400">PayOS VietQR</span>
            <span className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-amber-400">Chuyển Khoản Ngân Hàng</span>
            <span className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-amber-400">COD Thanh toán khi nhận</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 text-center text-xs text-neutral-600 border-t border-neutral-900 pt-6">
        © 2026 GLASSVAULT Eyewear Boutique. All rights reserved. Powered by Next.js Fullstack & Supabase PostgreSQL.
      </div>
    </footer>
  );
}
