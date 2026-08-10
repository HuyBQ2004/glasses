-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_key VARCHAR(50) UNIQUE NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;

-- 2. ACCOUNTS
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'customer',
    active BOOLEAN DEFAULT TRUE,
    fullname VARCHAR(150),
    phone VARCHAR(30),
    email VARCHAR(150),
    address TEXT,
    token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;

-- 3. STORES
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_name VARCHAR(150) NOT NULL,
    owner_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    shipper_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    warehouse_manager_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE stores DISABLE ROW LEVEL SECURITY;

-- 4. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cname VARCHAR(100) NOT NULL,
    store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
    manufacturer VARCHAR(100) DEFAULT 'Vietnam',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- 5. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    image TEXT NOT NULL,
    price NUMERIC(15, 2) NOT NULL,
    title TEXT,
    description TEXT,
    cate_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    quantity INT DEFAULT 0,
    sell_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
    manufacturer VARCHAR(100) DEFAULT 'Ray-Ban / Gentle Monster',
    frame_shape VARCHAR(100) DEFAULT 'Square',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 6. CART ITEMS
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    amount INT DEFAULT 1,
    reserved_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;

-- 7. SHIPPINGS
CREATE TABLE IF NOT EXISTS shippings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    address TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    shipper_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
    shipped_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE shippings DISABLE ROW LEVEL SECURITY;

-- 8. STOCK IMPORTS
CREATE TABLE IF NOT EXISTS stock_imports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    import_quantity INT NOT NULL,
    note TEXT,
    created_by UUID REFERENCES accounts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE stock_imports DISABLE ROW LEVEL SECURITY;

-- 9. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    total_price NUMERIC(15, 2) NOT NULL,
    note TEXT,
    create_date TIMESTAMPTZ DEFAULT NOW(),
    shipping_id UUID REFERENCES shippings(id) ON DELETE SET NULL,
    store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
    vat_percent NUMERIC(5, 2) DEFAULT 10,
    payment_method VARCHAR(50) DEFAULT 'COD',
    payment_status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- 10. ORDER DETAILS
CREATE TABLE IF NOT EXISTS order_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    product_image TEXT NOT NULL,
    product_price NUMERIC(15, 2) NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE order_details DISABLE ROW LEVEL SECURITY;

-- 11. VOUCHERS
CREATE TABLE IF NOT EXISTS vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent NUMERIC(5, 2) NOT NULL,
    max_discount NUMERIC(15, 2) DEFAULT 0,
    min_order_value NUMERIC(15, 2) DEFAULT 0,
    expiry_date TIMESTAMPTZ NOT NULL,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE vouchers DISABLE ROW LEVEL SECURITY;

-- 12. FEEDBACKS
CREATE TABLE IF NOT EXISTS feedbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    content TEXT,
    create_date TIMESTAMPTZ DEFAULT NOW(),
    is_edited BOOLEAN DEFAULT FALSE,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE feedbacks DISABLE ROW LEVEL SECURITY;

-- 13. SLIDERS
CREATE TABLE IF NOT EXISTS sliders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    image_url TEXT NOT NULL,
    back_link TEXT,
    status BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE sliders DISABLE ROW LEVEL SECURITY;

-- 14. HOME SETTINGS
CREATE TABLE IF NOT EXISTS home_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hero_badge VARCHAR(255) DEFAULT '👓 BỘ SƯU TẬP KÍNH MẮT HÀNG HIỆU 2026',
    hero_title VARCHAR(255) DEFAULT 'Nâng Tầm Ánh Nhìn',
    hero_highlight VARCHAR(255) DEFAULT 'Kính Mắt Đỉnh Cao',
    hero_description TEXT DEFAULT 'Khám phá thế giới kính mát và kính cận hàng hiệu Ray-Ban, Gentle Monster, Oakley, Gucci với thiết kế thời thượng và chống tia UV400 bảo vệ mắt tối đa.',
    primary_button_text VARCHAR(100) DEFAULT 'Khám Phá Ngay',
    secondary_button_text VARCHAR(100) DEFAULT 'Xem Ưu Đãi',
    featured_title VARCHAR(255) DEFAULT 'Mẫu Kính Mắt Nổi Bật',
    show_stats BOOLEAN DEFAULT TRUE,
    show_filter_sidebar BOOLEAN DEFAULT TRUE,
    show_featured_section BOOLEAN DEFAULT TRUE,
    featured_mode VARCHAR(50) DEFAULT 'newest',
    featured_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE home_settings DISABLE ROW LEVEL SECURITY;
