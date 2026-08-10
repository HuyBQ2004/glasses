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
  ShieldAlert
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

        // --- STRICT PAGE PROTECTION LOGIC matching AdminFilter ---
        
        // 1. Shipper: ONLY allowed /dashboard/shipping
        if (role === 'shipper') {
          if (pathname !== '/dashboard/shipping') {
            router.replace('/dashboard/shipping');
            return;
          }
        }

        // 2. Warehouse Manager: ONLY allowed /dashboard/stock, /dashboard/products, /dashboard/categories
        if (role === 'warehouse_manager') {
          const allowed = ['/dashboard/stock', '/dashboard/products', '/dashboard/categories'];
          if (!allowed.includes(pathname)) {
            router.replace('/dashboard/stock');
            return;
          }
        }

        // 3. Store Owner: Allowed /dashboard, /dashboard/products, /dashboard/orders, /dashboard/categories, /dashboard/vouchers, /dashboard/shipping, /dashboard/feedbacks
        //    CANNOT access /dashboard/staff (ONLY admin) or /dashboard/stock (ONLY warehouse_manager)
        if (role === 'owner') {
          if (pathname === '/dashboard/staff' || pathname === '/dashboard/stock') {
            router.replace('/dashboard');
            return;
          }
        }

        // 4. Admin: Allowed /dashboard, /dashboard/staff, /dashboard/products, /dashboard/orders, /dashboard/categories, /dashboard/vouchers, /dashboard/feedbacks
        if (role === 'admin') {
          if (pathname === '/dashboard/stock' || pathname === '/dashboard/shipping') {
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
  const isShipper = user.role === 'shipper';
  const isWarehouse = user.role === 'warehouse_manager';

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 border-r border-neutral-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          
          {/* Logo */}
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

          {/* User Info Badge */}
          <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
            <p className="text-xs text-neutral-400">Đang đăng nhập:</p>
            <p className="text-sm font-bold text-white truncate">{user.fullname || user.username}</p>
            <p className="text-xs text-amber-400 font-mono capitalize font-bold mt-0.5">Role: {user.role}</p>
          </div>

          {/* Navigation Links STRICTLY scoped by Role */}
          <nav className="space-y-1 text-sm font-medium">
            
            {/* Overview Statistics & Revenue (Admin & Owner ONLY) */}
            {(isAdmin || isOwner) && (
              <Link
                href="/dashboard"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                  pathname === '/dashboard' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" /> Tổng Quan & Doanh Thu
              </Link>
            )}

            {/* Staff / Account Management (ONLY System Admin) */}
            {isAdmin && (
              <Link
                href="/dashboard/staff"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                  pathname === '/dashboard/staff' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Users className="w-4 h-4" /> Quản Lý Tài Khoản (Admin)
              </Link>
            )}

            {/* Product Management (Admin, Owner, Warehouse Manager) */}
            {(isAdmin || isOwner || isWarehouse) && (
              <Link
                href="/dashboard/products"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                  pathname === '/dashboard/products' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Package className="w-4 h-4" /> Quản Lý Sản Phẩm
              </Link>
            )}

            {/* Order Management (Admin & Owner ONLY) */}
            {(isAdmin || isOwner) && (
              <Link
                href="/dashboard/orders"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                  pathname === '/dashboard/orders' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <ShoppingBag className="w-4 h-4" /> Quản Lý Đơn Hàng
              </Link>
            )}

            {/* Category Management (Admin, Owner, Warehouse Manager) */}
            {(isAdmin || isOwner || isWarehouse) && (
              <Link
                href="/dashboard/categories"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                  pathname === '/dashboard/categories' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <FolderTree className="w-4 h-4" /> Quản Lý Danh Mục
              </Link>
            )}

            {/* Voucher Management (Admin & Owner ONLY) */}
            {(isAdmin || isOwner) && (
              <Link
                href="/dashboard/vouchers"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                  pathname === '/dashboard/vouchers' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Tag className="w-4 h-4" /> Quản Lý Vouchers
              </Link>
            )}

            {/* Stock Import Management (ONLY Warehouse Manager) */}
            {isWarehouse && (
              <Link
                href="/dashboard/stock"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                  pathname === '/dashboard/stock' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Warehouse className="w-4 h-4" /> Quản Lý Nhập Kho
              </Link>
            )}

            {/* Shipping & Delivery Management (ONLY Shipper & Owner) */}
            {(isShipper || isOwner) && (
              <Link
                href="/dashboard/shipping"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                  pathname === '/dashboard/shipping' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Truck className="w-4 h-4" /> Quản Lý Giao Hàng
              </Link>
            )}

            {/* Feedback Management (Admin & Owner ONLY) */}
            {(isAdmin || isOwner) && (
              <Link
                href="/dashboard/feedbacks"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                  pathname === '/dashboard/feedbacks' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <MessageSquare className="w-4 h-4" /> Quản Lý Feedback
              </Link>
            )}
          </nav>
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
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
