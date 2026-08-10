'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Truck,
  Warehouse,
  Tag,
  MessageSquare,
  Users,
  LogOut,
  Home,
  ShoppingBag,
  Menu,
  X
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.success || !data.user || data.user.role === 'customer') {
          router.push('/login');
          return;
        }

        const role = data.user.role;
        setUser(data.user);

        // --- STRICT PAGE PROTECTION LOGIC ---
        if (role === 'owner') {
          if (pathname === '/dashboard/staff') {
            router.replace('/dashboard');
            return;
          }
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [pathname, router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center font-sans">
        Đang tải và xác thực phân quyền Dashboard...
      </div>
    );
  }

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const isOwner = user.role === 'owner';

  const renderNavLinks = () => (
    <nav className="space-y-1 text-sm font-medium">
      {(isAdmin || isOwner) && (
        <Link
          href="/dashboard"
          onClick={() => setIsMobileSidebarOpen(false)}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
            pathname === '/dashboard' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" /> Tổng Quan & Doanh Thu
        </Link>
      )}

      {isAdmin && (
        <Link
          href="/dashboard/staff"
          onClick={() => setIsMobileSidebarOpen(false)}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
            pathname === '/dashboard/staff' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Users className="w-4 h-4" /> Quản Lý Tài Khoản (Admin)
        </Link>
      )}

      {(isAdmin || isOwner) && (
        <Link
          href="/dashboard/products"
          onClick={() => setIsMobileSidebarOpen(false)}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
            pathname === '/dashboard/products' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Package className="w-4 h-4" /> Quản Lý Sản Phẩm
        </Link>
      )}

      {(isAdmin || isOwner) && (
        <Link
          href="/dashboard/orders"
          onClick={() => setIsMobileSidebarOpen(false)}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
            pathname === '/dashboard/orders' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Quản Lý Đơn Hàng
        </Link>
      )}

      {(isAdmin || isOwner) && (
        <Link
          href="/dashboard/categories"
          onClick={() => setIsMobileSidebarOpen(false)}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
            pathname === '/dashboard/categories' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <FolderTree className="w-4 h-4" /> Quản Lý Danh Mục
        </Link>
      )}

      {(isAdmin || isOwner) && (
        <Link
          href="/dashboard/stock"
          onClick={() => setIsMobileSidebarOpen(false)}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
            pathname === '/dashboard/stock' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Warehouse className="w-4 h-4" /> Quản Lý Nhập Kho
        </Link>
      )}

      {(isAdmin || isOwner) && (
        <Link
          href="/dashboard/shipping"
          onClick={() => setIsMobileSidebarOpen(false)}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
            pathname === '/dashboard/shipping' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Truck className="w-4 h-4" /> Quản Lý Giao Hàng
        </Link>
      )}

      {(isAdmin || isOwner) && (
        <Link
          href="/dashboard/vouchers"
          onClick={() => setIsMobileSidebarOpen(false)}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
            pathname === '/dashboard/vouchers' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Tag className="w-4 h-4" /> Quản Lý Vouchers
        </Link>
      )}

      {(isAdmin || isOwner) && (
        <Link
          href="/dashboard/feedbacks"
          onClick={() => setIsMobileSidebarOpen(false)}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
            pathname === '/dashboard/feedbacks' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Quản Lý Feedback
        </Link>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col md:flex-row font-sans">
      
      {/* MOBILE TOPBAR */}
      <div className="md:hidden bg-neutral-900 border-b border-neutral-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-neutral-950 font-black text-sm">
            👓
          </div>
          <span className="font-extrabold text-base text-white">GLASSVAULT</span>
        </Link>

        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 rounded-xl bg-neutral-800 text-amber-400 border border-neutral-700"
          aria-label="Toggle Dashboard Menu"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE SIDEBAR DRAWER OVERLAY */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm"
          />

          {/* Drawer */}
          <div className="relative w-4/5 max-w-xs bg-neutral-900 h-full p-5 flex flex-col justify-between z-10 shadow-2xl border-r border-neutral-800 overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-neutral-950 font-black text-sm">
                    👓
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-white">GLASSVAULT</span>
                    <span className="text-amber-500 font-bold text-[10px] block uppercase">
                      {user.role} Panel
                    </span>
                  </div>
                </div>
                <button onClick={() => setIsMobileSidebarOpen(false)} className="text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <p className="text-[11px] text-neutral-400">Đang đăng nhập:</p>
                <p className="text-xs font-bold text-white truncate">{user.fullname || user.username}</p>
                <p className="text-[11px] text-amber-400 font-mono capitalize font-bold">Role: {user.role}</p>
              </div>

              {renderNavLinks()}
            </div>

            <div className="space-y-2 border-t border-neutral-800 pt-4 mt-6">
              <Link
                href="/"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 text-sm font-medium transition-colors"
              >
                <Home className="w-4 h-4" /> Trang Bán Hàng
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-sm font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" /> Đăng Xuất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-neutral-900 border-r border-neutral-800 p-6 flex-col justify-between shrink-0 h-screen sticky top-0">
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-neutral-950 font-black text-lg">
              👓
            </div>
            <div>
              <span className="font-extrabold text-lg text-white">GLASSVAULT</span>
              <span className="text-amber-500 font-bold text-xs block uppercase tracking-wider">
                {user.role} Panel
              </span>
            </div>
          </Link>

          <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
            <p className="text-xs text-neutral-400">Đang đăng nhập:</p>
            <p className="text-sm font-bold text-white truncate">{user.fullname || user.username}</p>
            <p className="text-xs text-amber-400 font-mono capitalize font-bold mt-0.5">Role: {user.role}</p>
          </div>

          {renderNavLinks()}
        </div>

        <div className="space-y-2 border-t border-neutral-800 pt-4">
          <Link
            href="/"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 text-sm font-medium transition-colors"
          >
            <Home className="w-4 h-4" /> Trang Bán Hàng
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" /> Đăng Xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-w-0">{children}</main>
    </div>
  );
}

