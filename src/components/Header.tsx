'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut, LayoutDashboard, Search, ShoppingBag, Package, Sun, Moon } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  };

  const fetchUserAndCart = async () => {
    try {
      const resUser = await fetch('/api/auth/me');
      const dataUser = await resUser.json();
      if (dataUser.success) {
        setUser(dataUser.user);

        const resCart = await fetch('/api/cart');
        const dataCart = await resCart.json();
        if (dataCart.success && dataCart.cart) {
          const total = dataCart.cart.reduce((acc: number, item: any) => acc + item.amount, 0);
          setCartCount(total);
        }
      } else {
        setUser(null);
        setCartCount(0);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUserAndCart();
    const handleCartUpdate = () => fetchUserAndCart();
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setCartCount(0);
    router.push('/login');
    router.refresh();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* 1. BRAND LOGO */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-11 h-11 bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            👓
          </div>
          <div>
            <span className="font-extrabold text-2xl tracking-wider bg-gradient-to-r from-white via-neutral-200 to-amber-400 bg-clip-text text-transparent">
              GLASS<span className="text-amber-500">VAULT</span>
            </span>
            <span className="block text-[10px] tracking-widest text-neutral-400 font-medium uppercase">
              Luxury Eyewear 2026
            </span>
          </div>
        </Link>

        {/* 2. SEARCH BAR */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md items-center relative">
          <input
            type="text"
            placeholder="Tìm kính Ray-Ban, Gentle Monster, Oakley..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-800/90 border border-neutral-700/80 rounded-full py-2.5 pl-4 pr-10 text-sm text-neutral-200 placeholder-neutral-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
          />
          <button type="submit" className="absolute right-3.5 top-3 text-neutral-400 hover:text-amber-400 transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* 3. THEME TOGGLE & AVATAR / USER PROFILE */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
            className="p-2.5 rounded-full bg-neutral-800 hover:bg-neutral-750 text-amber-400 hover:text-amber-300 transition-all border border-neutral-700/80 shadow-md"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Avatar Profile / Login Icon */}
          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-2 p-1 rounded-full bg-neutral-800 border border-neutral-700 hover:border-amber-500/60 transition-all shadow-md">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center font-black text-neutral-950 text-sm uppercase shadow-sm">
                  {user.username.slice(0, 2)}
                </div>
              </button>

              {/* Avatar Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-60 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-2 hidden group-hover:block hover:block z-50">
                <div className="px-3.5 py-2.5 border-b border-neutral-800 mb-1">
                  <p className="text-sm font-bold text-white truncate">{user.fullname || user.username}</p>
                  <p className="text-xs text-amber-400 capitalize font-mono font-bold mt-0.5">Role: {user.role}</p>
                </div>

                {user.role !== 'customer' && (
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-amber-400 font-bold hover:bg-neutral-800 rounded-xl transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard Quản Trị
                  </Link>
                )}

                <Link
                  href="/orders"
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 rounded-xl transition-colors font-medium"
                >
                  <Package className="w-4 h-4 text-neutral-400" /> Đơn Hàng Của Tôi
                </Link>

                <Link
                  href="/cart"
                  className="flex items-center justify-between px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 rounded-xl transition-colors font-medium"
                >
                  <span className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4 text-neutral-400" /> Giỏ Hàng
                  </span>
                  {cartCount > 0 && (
                    <span className="bg-amber-500 text-neutral-950 font-bold text-xs px-2 py-0.5 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors mt-1 font-semibold"
                >
                  <LogOut className="w-4 h-4" /> Đăng Xuất
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 hover:border-amber-500 text-amber-400 hover:bg-neutral-750 transition-all flex items-center justify-center shadow-md"
              title="Đăng Nhập Tài Khoản"
            >
              <User className="w-5 h-5" />
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
