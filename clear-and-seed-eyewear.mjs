import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xnarijpflhctrbeamakp.supabase.co';
const supabaseKey = 'sb_publishable_5FbQ4qUH-Z-KHpFCo8Ly8g_-cjUuMme';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runReset() {
  console.log('Cleaning old shoe data and seeding Eyewear products into Supabase Cloud...');

  // 1. Delete old order details, cart items, feedbacks, products, categories
  await supabase.from('order_details').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('cart_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('feedbacks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('vouchers').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('Deleted old shoe items.');

  // 2. Get store
  const { data: stores } = await supabase.from('stores').select('*').limit(1);
  const storeId = stores && stores.length > 0 ? stores[0].id : null;

  // 3. Create Eyewear Categories
  const categoriesData = [
    { cname: 'Kính Râm Hàng Hiệu (Sunglasses)', manufacturer: 'Ray-Ban / Gentle Monster', store_id: storeId },
    { cname: 'Kính Chống Ánh Sáng Xanh (Blue Light)', manufacturer: 'Tom Ford / Bolon', store_id: storeId },
    { cname: 'Kính Thời Trang Gentle Monster', manufacturer: 'Gentle Monster Korea', store_id: storeId },
    { cname: 'Kính Thể Thao Oakley', manufacturer: 'Oakley USA', store_id: storeId },
    { cname: 'Kính Cận Titan Cao Cấp', manufacturer: 'Gucci / PRADA', store_id: storeId },
  ];

  const createdCategories = {};
  for (const cat of categoriesData) {
    const { data: inserted } = await supabase.from('categories').insert(cat).select().single();
    if (inserted) {
      createdCategories[cat.cname] = inserted;
    }
  }

  console.log('Created Eyewear categories.');

  // 4. Create Eyewear Products
  const productsData = [
    {
      name: 'Kính Râm Ray-Ban Aviator Classic Gold',
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
      price: 3850000,
      title: 'Kính Mát Ray-Ban Aviator Khung Mạ Vàng Cổ Điển',
      description: 'Thiết kế giọt lệ huyền thoại mang tính biểu tượng của Ray-Ban, tròng kính mạ xanh G-15 chống tia UV400 bảo vệ mắt tối đa dưới ánh nắng gay gắt.',
      cate_id: createdCategories['Kính Râm Hàng Hiệu (Sunglasses)']?.id || null,
      quantity: 40,
      store_id: storeId,
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
      store_id: storeId,
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
      store_id: storeId,
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
      store_id: storeId,
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
      store_id: storeId,
      manufacturer: 'Gucci',
      frame_shape: 'Mắt Mèo (Cat-Eye)',
    },
  ];

  const { data: insertedProds, error: prodErr } = await supabase.from('products').insert(productsData).select();
  if (prodErr) {
    console.error('Error inserting products:', prodErr);
  } else {
    console.log(`Successfully inserted ${insertedProds?.length || 0} Eyewear products!`);
  }

  // 5. Create Voucher
  await supabase.from('vouchers').insert({
    code: 'KINH20',
    discount_percent: 20,
    max_discount: 500000,
    min_order_value: 1000000,
    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    store_id: storeId,
  });

  console.log('Successfully updated Eyewear voucher KINH20!');
}

runReset();
