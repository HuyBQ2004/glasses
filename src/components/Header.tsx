'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, User, LogOut, LayoutDashboard, Search, Menu, X, Shield, Truck, Package, Sun, Moon, Eye } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Initialize theme from localStorage or preferred scheme
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

        // fetch cart
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
    <header className="sticky top-0 z-50 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
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

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative w-80">
          <input
            type="text"
            placeholder="Tìm kính Ray-Ban, Gentle Monster, Oakley..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-800/80 border border-neutral-700/80 rounded-full py-2 pl-4 pr-10 text-sm text-neutral-200 placeholder-neutral-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
          />
          <button type="submit" className="absolute right-3 text-neutral-400 hover:text-amber-400">
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 font-medium text-sm text-neutral-300">
          <Link href="/" className="hover:text-amber-400 transition-colors">
            Trang Chủ
          </Link>
          <Link href="/products" className="hover:text-amber-400 transition-colors">
            Kính Mắt & Râm
          </Link>
          <Link href="/orders" className="hover:text-amber-400 transition-colors">
            Đơn Hàng
          </Link>
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3">
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
            className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-amber-400 hover:text-amber-300 transition-all border border-neutral-700/50"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-indigo-400" />}
          </button>

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors border border-neutral-700/50"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-neutral-950 font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Section */}
          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-2 p-1.5 rounded-full bg-neutral-800 border border-neutral-700 hover:border-amber-500/50 transition-all">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center font-bold text-neutral-950 text-sm uppercase">
                  {user.username.slice(0, 2)}
                </div>
                <span className="hidden sm:inline font-semibold text-xs text-neutral-200 max-w-[100px] truncate">
                  {user.fullname || user.username}
                </span>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-2 hidden group-hover:block hover:block z-50">
                <div className="px-3 py-2 border-b border-neutral-800 mb-1">
                  <p className="text-sm font-semibold text-white truncate">{user.fullname || user.username}</p>
                  <p className="text-xs text-amber-400 capitalize font-mono">Role: {user.role}</p>
                </div>

                {user.role !== 'customer' && (
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 rounded-lg transition-colors text-amber-400 font-semibold"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard Quản Trị
                  </Link>
                )}

                <Link
                  href="/orders"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <Package className="w-4 h-4" /> Đơn Hàng Của Tôi
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors mt-1"
                >
                  <LogOut className="w-4 h-4" /> Đăng Xuất
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm px-4 py-2 rounded-lg font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                Đăng Nhập
              </Link>
              <Link
                href="/signup"
                className="text-sm px-4 py-2 rounded-lg font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all shadow-md shadow-amber-500/20"
              >
                Đăng Ký
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-neutral-400 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-neutral-900 border-b border-neutral-800 px-4 py-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex items-center relative mb-3">
            <input
              type="text"
              placeholder="Tìm kiếm kính..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg py-2 pl-4 pr-10 text-sm text-white"
            />
            <button type="submit" className="absolute right-3 text-neutral-400">
              <Search className="w-4 h-4" />
            </button>
          </form>
          <Link href="/" className="block py-2 text-neutral-300 hover:text-amber-400">
            Trang Chủ
          </Link>
          <Link href="/products" className="block py-2 text-neutral-300 hover:text-amber-400">
            Kính Mắt & Râm
          </Link>
          <Link href="/orders" className="block py-2 text-neutral-300 hover:text-amber-400">
            Đơn Hàng
          </Link>
        </div>
      )}
    </header>
  );
}
