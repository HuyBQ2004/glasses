import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    // Clear old products, categories, cart items, feedbacks
    await supabase.from('order_details').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('cart_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('feedbacks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 1. Roles
    const rolesData = [
      { role_key: 'admin', role_name: 'Quản trị hệ thống', description: 'Toàn quyền quản trị hệ thống' },
      { role_key: 'owner', role_name: 'Chủ cửa hàng', description: 'Quản lý thông tin và sản phẩm kính mắt' },
      { role_key: 'shipper', role_name: 'Nhân viên giao hàng', description: 'Cập nhật trạng thái vận chuyển' },
      { role_key: 'warehouse_manager', role_name: 'Quản lý kho', description: 'Nhập kho kính và quản lý số lượng tồn' },
      { role_key: 'customer', role_name: 'Khách hàng', description: 'Mua sắm kính mắt và đặt hàng' },
    ];

    for (const r of rolesData) {
      const { data: existing } = await supabase.from('roles').select('id').eq('role_key', r.role_key).maybeSingle();
      if (!existing) {
        await supabase.from('roles').insert(r);
      }
    }

    // 2. Accounts
    const defaultPassword = hashPassword('123456');

    const accountsData = [
      { username: 'admin', password: defaultPassword, role: 'admin', fullname: 'Quản Trị Viên VIP', email: 'admin@glassvault.vn', phone: '0901234567', address: 'Hà Nội' },
      { username: 'owner1', password: defaultPassword, role: 'owner', fullname: 'Chủ Cửa Hàng GLASSVAULT', email: 'owner@glassvault.vn', phone: '0912345678', address: 'TP. Hồ Chí Minh' },
      { username: 'shipper1', password: defaultPassword, role: 'shipper', fullname: 'Nguyễn Văn Shipper', email: 'shipper@glassvault.vn', phone: '0988776655', address: 'Đà Nẵng' },
      { username: 'warehouse1', password: defaultPassword, role: 'warehouse_manager', fullname: 'Trần Văn Thủ Kho', email: 'warehouse@glassvault.vn', phone: '0977665544', address: 'Hà Nội' },
      { username: 'customer1', password: defaultPassword, role: 'customer', fullname: 'Lê Văn Khách Hàng', email: 'customer@gmail.com', phone: '0966554433', address: 'Cầu Giấy, Hà Nội' },
    ];

    const createdAccounts: Record<string, any> = {};
    for (const acc of accountsData) {
      let { data: user } = await supabase.from('accounts').select('*').eq('username', acc.username).maybeSingle();
      if (!user) {
        const { data: inserted } = await supabase.from('accounts').insert(acc).select().single();
        user = inserted;
      }
      if (user) {
        createdAccounts[acc.username] = user;
      }
    }

    // 3. Store
    let { data: store } = await supabase.from('stores').select('*').eq('store_name', 'GLASSVAULT Luxury Eyewear Boutique').maybeSingle();
    if (!store && createdAccounts['owner1']) {
      const { data: insertedStore } = await supabase.from('stores').insert({
        store_name: 'GLASSVAULT Luxury Eyewear Boutique',
        owner_id: createdAccounts['owner1'].id,
        shipper_id: createdAccounts['shipper1']?.id || null,
        warehouse_manager_id: createdAccounts['warehouse1']?.id || null,
        active: true,
      }).select().single();
      store = insertedStore;
    }

    // 4. Eyewear Categories
    const categoriesData = [
      { cname: 'Kính Râm Hàng Hiệu (Sunglasses)', manufacturer: 'Ray-Ban / Gentle Monster', store_id: store?.id || null },
      { cname: 'Kính Chống Ánh Sáng Xanh (Blue Light)', manufacturer: 'Tom Ford / Bolon', store_id: store?.id || null },
      { cname: 'Kính Thời Trang Gentle Monster', manufacturer: 'Gentle Monster Korea', store_id: store?.id || null },
      { cname: 'Kính Thể Thao Oakley', manufacturer: 'Oakley USA', store_id: store?.id || null },
      { cname: 'Kính Cận Titan Cao Cấp', manufacturer: 'Gucci / PRADA', store_id: store?.id || null },
    ];

    const createdCategories: Record<string, any> = {};
    for (const cat of categoriesData) {
      const { data: insertedCat } = await supabase.from('categories').insert(cat).select().single();
      if (insertedCat) {
        createdCategories[cat.cname] = insertedCat;
      }
    }

    // 5. Eyewear Products
    const productsData = [
      {
        name: 'Kính Râm Ray-Ban Aviator Classic Gold',
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
        price: 3850000,
        title: 'Kính Mát Ray-Ban Aviator Khung Mạ Vàng Cổ Điển',
        description: 'Thiết kế giọt lệ huyền thoại mang tính biểu tượng của Ray-Ban, tròng kính mạ xanh G-15 chống tia UV400 bảo vệ mắt tối đa dưới ánh nắng gay gắt.',
        cate_id: createdCategories['Kính Râm Hàng Hiệu (Sunglasses)']?.id || null,
        quantity: 40,
        store_id: store?.id || null,
        manufacturer: 'Ray-Ban',
        frame_shape: 'Mắt Phi Công (Aviator)',
      },
      {
        name: 'Kính Thời Trang Gentle Monster South Side 01',
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
        price: 5450000,
        title: 'Kính Mát Gentle Monster Khung Đen Thời Thượng',
        description: 'Mẫu gọng kính vuông Acetate màu đen cao cấp thanh lịch từ Hàn Quốc, logo Gentle Monster mạ vàng chạm khắc tỉ mỉ bên gọng.',
        cate_id: createdCategories['Kính Thời Trang Gentle Monster']?.id || null,
        quantity: 30,
        store_id: store?.id || null,
        manufacturer: 'Gentle Monster',
        frame_shape: 'Mắt Vuông (Square)',
      },
      {
        name: 'Kính Thể Thao Oakley Holbrook Matte Black',
        image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80',
        price: 4200000,
        title: 'Kính Mát Oakley Thể Thao Tròng Prizm Siêu Nét',
        description: 'Chất liệu gọng O Matter siêu nhẹ chống va đập mạnh, tròng kính Prizm công nghệ tăng cường độ tương phản cho vận động viên ngoài trời.',
        cate_id: createdCategories['Kính Thể Thao Oakley']?.id || null,
        quantity: 35,
        store_id: store?.id || null,
        manufacturer: 'Oakley',
        frame_shape: 'Gọng Chữ Nhật (Rectangle)',
      },
      {
        name: 'Kính Chống Ánh Sáng Xanh Tom Ford Blue Block',
        image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=800&q=80',
        price: 6800000,
        title: 'Kính Cận Tom Ford Gọng Tròn Chống Mỏi Mắt',
        description: 'Tròng kính tích hợp lớp phủ ngắt ánh sáng xanh từ màn hình máy tính & điện thoại, gọng kim loại mạ vàng chữ T biểu tượng Tom Ford.',
        cate_id: createdCategories['Kính Chống Ánh Sáng Xanh (Blue Light)']?.id || null,
        quantity: 25,
        store_id: store?.id || null,
        manufacturer: 'Tom Ford',
        frame_shape: 'Mắt Tròn (Round)',
      },
      {
        name: 'Kính Râm Gucci Cat-Eye Oversized Sunglasses',
        image: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80',
        price: 7900000,
        title: 'Kính Mát Gucci Mắt Mèo Quyến Rũ Nữ Tính',
        description: 'Dáng mắt mèo sang trọng nâng tầm thần thái quý cô, tròng kính tráng gương chống chói chuẩn xa xỉ từ Ý.',
        cate_id: createdCategories['Kính Cận Titan Cao Cấp']?.id || null,
        quantity: 20,
        store_id: store?.id || null,
        manufacturer: 'Gucci',
        frame_shape: 'Mắt Mèo (Cat-Eye)',
      },
    ];

    await supabase.from('products').insert(productsData);

    // 6. Sliders
    const slidersData = [
      {
        title: 'BỘ SƯU TẬP KÍNH MẮT GENTLE MONSTER 2026',
        image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1200&q=80',
        description: 'Giảm giá tới 20% cho đơn hàng đầu tiên với mã KINH20',
        status: true,
      },
      {
        title: 'KÍNH MÁT RAY-BAN & OAKLEY CHÍNH HÃNG',
        image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=80',
        description: 'Miễn phí giao hàng & Đo khám thị lực tận nơi',
        status: true,
      },
    ];

    for (const s of slidersData) {
      const { data: exist } = await supabase.from('sliders').select('id').eq('title', s.title).maybeSingle();
      if (!exist) {
        await supabase.from('sliders').insert(s);
      }
    }

    // 7. Voucher
    await supabase.from('vouchers').delete().eq('code', 'KINH20');
    await supabase.from('vouchers').insert({
      code: 'KINH20',
      discount_percent: 20,
      max_discount: 500000,
      min_order_value: 1000000,
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      store_id: store?.id || null,
    });

    return NextResponse.json({
      success: true,
      message: 'Đã dọn dẹp dữ liệu giày cũ và cập nhật thành công 5 mẫu Kính Mắt Hàng Hiệu mới (Ray-Ban, Gentle Monster, Oakley, Tom Ford, Gucci)!',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
