-- 0. AUTO ADD MISSING COLUMNS IF TABLE ALREADY EXISTS
ALTER TABLE products ADD COLUMN IF NOT EXISTS frame_shape VARCHAR(100) DEFAULT 'Square';
ALTER TABLE products ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(100) DEFAULT 'Ray-Ban / Gentle Monster';

-- 1. DISABLE RLS FOR ALL TABLES
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE stores DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE shippings DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_imports DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks DISABLE ROW LEVEL SECURITY;
ALTER TABLE sliders DISABLE ROW LEVEL SECURITY;
ALTER TABLE home_settings DISABLE ROW LEVEL SECURITY;

-- 2. INSERT SEED ACCOUNTS (Password: 123456 - bcrypt hash $2b$10$0tVjuB2n/F2b5jkjBdbmce2Xye16Reztdcd3R0WyyjIc.lv7H.mMC)
INSERT INTO accounts (id, username, password, role, active, fullname, email, phone, address)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin', '$2b$10$0tVjuB2n/F2b5jkjBdbmce2Xye16Reztdcd3R0WyyjIc.lv7H.mMC', 'admin', true, 'Quản Trị Viên VIP', 'admin@glassvault.vn', '0901234567', 'Hà Nội'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'owner1', '$2b$10$0tVjuB2n/F2b5jkjBdbmce2Xye16Reztdcd3R0WyyjIc.lv7H.mMC', 'owner', true, 'Chủ Cửa Hàng GLASSVAULT', 'owner@glassvault.vn', '0912345678', 'TP. Hồ Chí Minh'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'shipper1', '$2b$10$0tVjuB2n/F2b5jkjBdbmce2Xye16Reztdcd3R0WyyjIc.lv7H.mMC', 'shipper', true, 'Nguyễn Văn Shipper', 'shipper@glassvault.vn', '0988776655', 'Đà Nẵng'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'warehouse1', '$2b$10$0tVjuB2n/F2b5jkjBdbmce2Xye16Reztdcd3R0WyyjIc.lv7H.mMC', 'warehouse_manager', true, 'Trần Văn Thủ Kho', 'warehouse@glassvault.vn', '0977665544', 'Hà Nội'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'customer1', '$2b$10$0tVjuB2n/F2b5jkjBdbmce2Xye16Reztdcd3R0WyyjIc.lv7H.mMC', 'customer', true, 'Lê Văn Khách Hàng', 'customer@gmail.com', '0966554433', 'Cầu Giấy, Hà Nội')
ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password;

-- 3. INSERT STORE
INSERT INTO stores (id, store_name, owner_id, shipper_id, warehouse_manager_id, active)
VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'GLASSVAULT Luxury Eyewear Boutique', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', true)
ON CONFLICT DO NOTHING;

-- 4. INSERT EYEWEAR CATEGORIES
INSERT INTO categories (id, cname, manufacturer, store_id)
VALUES 
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'Kính Râm Hàng Hiệu (Sunglasses)', 'Ray-Ban / Gentle Monster', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c22', 'Kính Chống Ánh Sáng Xanh (Blue Light)', 'Tom Ford / Bolon', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'Kính Thời Trang Gentle Monster', 'Gentle Monster Korea', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c44', 'Kính Thể Thao Oakley', 'Oakley USA', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c55', 'Kính Cận Titan Cao Cấp', 'Gucci / PRADA', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11')
ON CONFLICT DO NOTHING;

-- 5. INSERT EYEWEAR PRODUCTS (With Brands & Frame Shapes)
INSERT INTO products (id, name, image, price, title, description, cate_id, quantity, store_id, manufacturer, frame_shape)
VALUES
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11', 'Kính Râm Ray-Ban Aviator Classic Gold', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80', 3850000, 'Kính Mát Ray-Ban Aviator Khung Mạ Vàng Cổ Điển', 'Thiết kế giọt lệ huyền thoại mang tính biểu tượng của Ray-Ban, tròng kính mạ xanh G-15 chống tia UV400 bảo vệ mắt tối đa dưới ánh nắng gay gắt.', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 40, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'Ray-Ban', 'Mắt Phi Công (Aviator)'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d22', 'Kính Thời Trang Gentle Monster South Side 01', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80', 5450000, 'Kính Mát Gentle Monster Khung Đen Thời Thượng', 'Mẫu gọng kính vuông Acetate màu đen cao cấp thanh lịch từ Hàn Quốc, logo Gentle Monster mạ vàng chạm khắc tỉ mỉ bên gọng.', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 30, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'Gentle Monster', 'Mắt Vuông (Square)'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d33', 'Kính Thể Thao Oakley Holbrook Matte Black', 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80', 4200000, 'Kính Mát Oakley Thể Thao Tròng Prizm Siêu Nét', 'Chất liệu gọng O Matter siêu nhẹ chống va đập mạnh, tròng kính Prizm công nghệ tăng cường độ tương phản cho vận động viên ngoài trời.', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c44', 35, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'Oakley', 'Gọng Chữ Nhật (Rectangle)'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 'Kính Chống Ánh Sáng Xanh Tom Ford Blue Block', 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=800&q=80', 6800000, 'Kính Cận Tom Ford Gọng Tròn Chống Mỏi Mắt', 'Tròng kính tích hợp lớp phủ ngắt ánh sáng xanh từ màn hình máy tính & điện thoại, gọng kim loại mạ vàng chữ T biểu tượng Tom Ford.', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c22', 25, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'Tom Ford', 'Mắt Tròn (Round)'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d55', 'Kính Râm Gucci Cat-Eye Oversized Sunglasses', 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80', 7900000, 'Kính Mát Gucci Mắt Mèo Quyến Rũ Nữ Tính', 'Dáng mắt mèo sang trọng nâng tầm thần thái quý cô, tròng kính tráng gương chống chói chuẩn xa xỉ từ Ý.', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 20, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'Gucci', 'Mắt Mèo (Cat-Eye)')
ON CONFLICT DO NOTHING;

-- 6. INSERT SLIDERS
INSERT INTO sliders (title, image_url, description, status)
VALUES
  ('BỘ SƯU TẬP KÍNH MẮT GENTLE MONSTER 2026', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1200&q=80', 'Giảm giá tới 20% cho đơn hàng đầu tiên với mã KINH20', true),
  ('KÍNH MÁT RAY-BAN & OAKLEY CHÍNH HÃNG', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=80', 'Miễn phí giao hàng & Đo khám thị lực tận nơi', true);

-- 7. INSERT VOUCHER
INSERT INTO vouchers (code, discount_percent, max_discount, min_order_value, expiry_date, store_id)
VALUES ('KINH20', 20, 500000, 1000000, NOW() + INTERVAL '30 days', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11')
ON CONFLICT (code) DO NOTHING;
