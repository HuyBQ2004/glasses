import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = 'https://xnarijpflhctrbeamakp.supabase.co';
const supabaseAnonKey = 'sb_publishable_5FbQ4qUH-Z-KHpFCo8Ly8g_-cjUuMme';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

async function runSeed() {
  console.log('🌱 Đang tiến hành nạp dữ liệu mẫu vào Supabase Cloud...');
  try {
    // 1. Roles
    const rolesData = [
      { role_key: 'admin', role_name: 'Quản trị hệ thống', description: 'Toàn quyền quản trị hệ thống' },
      { role_key: 'owner', role_name: 'Chủ cửa hàng', description: 'Quản lý thông tin và sản phẩm cửa hàng' },
      { role_key: 'shipper', role_name: 'Nhân viên giao hàng', description: 'Cập nhật trạng thái vận chuyển' },
      { role_key: 'warehouse_manager', role_name: 'Quản lý kho', description: 'Nhập kho và quản lý số lượng tồn' },
      { role_key: 'customer', role_name: 'Khách hàng', description: 'Mua sắm và đặt hàng' },
    ];

    for (const r of rolesData) {
      const { data: existing } = await supabase.from('roles').select('id').eq('role_key', r.role_key).maybeSingle();
      if (!existing) {
        await supabase.from('roles').insert(r);
      }
    }
    console.log('✅ 1. Roles seeded');

    // 2. Accounts
    const defaultPassword = hashPassword('123456');

    const accountsData = [
      { username: 'admin', password: defaultPassword, role: 'admin', fullname: 'Quản Trị Viên VIP', email: 'admin@shoestore.vn', phone: '0901234567', address: 'Hà Nội' },
      { username: 'owner1', password: defaultPassword, role: 'owner', fullname: 'Chủ Cửa Hàng Nike Store', email: 'owner@shoestore.vn', phone: '0912345678', address: 'TP. Hồ Chí Minh' },
      { username: 'shipper1', password: defaultPassword, role: 'shipper', fullname: 'Nguyễn Văn Shipper', email: 'shipper@shoestore.vn', phone: '0988776655', address: 'Đà Nẵng' },
      { username: 'warehouse1', password: defaultPassword, role: 'warehouse_manager', fullname: 'Trần Văn Thủ Kho', email: 'warehouse@shoestore.vn', phone: '0977665544', address: 'Hà Nội' },
      { username: 'customer1', password: defaultPassword, role: 'customer', fullname: 'Lê Văn Khách Hàng', email: 'customer@gmail.com', phone: '0966554433', address: 'Cầu Giấy, Hà Nội' },
    ];

    const createdAccounts = {};
    for (const acc of accountsData) {
      let { data: user } = await supabase.from('accounts').select('*').eq('username', acc.username).maybeSingle();
      if (!user) {
        const { data: inserted, error } = await supabase.from('accounts').insert(acc).select().single();
        if (error) console.error('Error inserting user', acc.username, error.message);
        user = inserted;
      }
      if (user) {
        createdAccounts[acc.username] = user;
      }
    }
    console.log('✅ 2. Accounts seeded (admin, owner1, shipper1, warehouse1, customer1 with password "123456")');

    // 3. Store
    let { data: store } = await supabase.from('stores').select('*').eq('store_name', 'Sneaker Flagship Store').maybeSingle();
    if (!store && createdAccounts['owner1']) {
      const { data: insertedStore } = await supabase.from('stores').insert({
        store_name: 'Sneaker Flagship Store',
        owner_id: createdAccounts['owner1'].id,
        shipper_id: createdAccounts['shipper1']?.id || null,
        warehouse_manager_id: createdAccounts['warehouse1']?.id || null,
        active: true,
      }).select().single();
      store = insertedStore;
    }
    console.log('✅ 3. Store seeded');

    // 4. Categories
    const categoriesData = [
      { cname: 'Nike Jordan', manufacturer: 'Nike USA' },
      { cname: 'Adidas Yeezy & Boost', manufacturer: 'Adidas Germany' },
      { cname: 'Puma Retro', manufacturer: 'Puma' },
      { cname: 'Converse All Star', manufacturer: 'Converse' },
      { cname: 'New Balance 550', manufacturer: 'New Balance' },
    ];

    const createdCategories = {};
    for (const cat of categoriesData) {
      let { data: category } = await supabase.from('categories').select('*').eq('cname', cat.cname).maybeSingle();
      if (!category) {
        const { data: insertedCat } = await supabase.from('categories').insert({ ...cat, store_id: store?.id || null }).select().single();
        category = insertedCat;
      }
      if (category) {
        createdCategories[cat.cname] = category;
      }
    }
    console.log('✅ 4. Categories seeded');

    // 5. Products
    const productsData = [
      {
        name: 'Nike Air Jordan 1 Low Retro OG',
        image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
        price: 3450000,
        title: 'Giày Thể Thao Nike Air Jordan 1 Đẳng Cấp',
        description: 'Mẫu sneaker cổ thấp mang tính biểu tượng với phối màu Chicago cổ điển, chất liệu da cao cấp mềm mại và đế Air êm ái.',
        cate_id: createdCategories['Nike Jordan']?.id || null,
        quantity: 50,
        store_id: store?.id || null,
        manufacturer: 'Nike',
      },
      {
        name: 'Adidas Yeezy Boost 350 V2 Onyx',
        image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
        price: 4890000,
        title: 'Giày Thể Thao Adidas Yeezy Boost 350 Đen Tuyền',
        description: 'Phối màu Onyx bí ẩn với công nghệ vải Primeknit ôm sát chân và bộ đệm Boost siêu êm đem lại trải nghiệm di chuyển đỉnh cao.',
        cate_id: createdCategories['Adidas Yeezy & Boost']?.id || null,
        quantity: 35,
        store_id: store?.id || null,
        manufacturer: 'Adidas',
      },
      {
        name: 'New Balance 550 White Green',
        image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80',
        price: 3200000,
        title: 'Giày Sneaker New Balance 550 Retro Basketball',
        description: 'Thiết kế lấy cảm hứng từ bóng rổ thập niên 80 với phối màu trắng xanh thanh lịch, dễ phối đồ hàng ngày.',
        cate_id: createdCategories['New Balance 550']?.id || null,
        quantity: 40,
        store_id: store?.id || null,
        manufacturer: 'New Balance',
      },
      {
        name: 'Puma Suede Classic XXI',
        image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
        price: 1950000,
        title: 'Giày Puma Da Lộn Cổ Điển',
        description: 'Dòng sản phẩm truyền thống của Puma với chất liệu da lộn mềm mại, kiểu dáng trẻ trung năng động.',
        cate_id: createdCategories['Puma Retro']?.id || null,
        quantity: 60,
        store_id: store?.id || null,
        manufacturer: 'Puma',
      },
      {
        name: 'Converse Chuck Taylor 70 High Vintage',
        image: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=800&q=80',
        price: 2100000,
        title: 'Giày Vải Converse Chuck 70 Cổ Cao',
        description: 'Vải canvas dày dặn, phần đế ngà phủ bóng cổ điển cùng lót OrthoLite đem đến sự thoải mái suốt ngày dài.',
        cate_id: createdCategories['Converse All Star']?.id || null,
        quantity: 45,
        store_id: store?.id || null,
        manufacturer: 'Converse',
      },
    ];

    for (const p of productsData) {
      const { data: exist } = await supabase.from('products').select('id').eq('name', p.name).maybeSingle();
      if (!exist) {
        await supabase.from('products').insert(p);
      }
    }
    console.log('✅ 5. Products seeded');

    // 6. Sliders
    const slidersData = [
      {
        title: 'BỘ SƯU TẬP NIKE AIR JORDAN 2026',
        image_url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=80',
        description: 'Giảm giá tới 20% cho đơn hàng đầu tiên với mã GIAM20',
        status: true,
      },
      {
        title: 'ADIDAS BOOST & YEEZY CHÍNH HÃNG',
        image_url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80',
        description: 'Miễn phí giao hàng toàn quốc cho đơn hàng từ 1.000.000đ',
        status: true,
      },
    ];

    for (const s of slidersData) {
      const { data: exist } = await supabase.from('sliders').select('id').eq('title', s.title).maybeSingle();
      if (!exist) {
        await supabase.from('sliders').insert(s);
      }
    }
    console.log('✅ 6. Sliders seeded');

    // 7. Voucher
    const { data: voucher } = await supabase.from('vouchers').select('id').eq('code', 'GIAM20').maybeSingle();
    if (!voucher) {
      await supabase.from('vouchers').insert({
        code: 'GIAM20',
        discount_percent: 20,
        max_discount: 500000,
        min_order_value: 1000000,
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        store_id: store?.id || null,
      });
    }
    console.log('✅ 7. Vouchers seeded');

    console.log('🎉 TẤT CẢ DỮ LIỆU ĐÃ ĐƯỢC NẠP VÀO SUPABASE THÀNH CÔNG!');
  } catch (err) {
    console.error('❌ Lỗi khi nạp dữ liệu:', err);
  }
}

runSeed();
