import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    // 1. Clear demo tables
    await supabase.from('order_details').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('cart_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('feedbacks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('stock_imports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('vouchers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('shippings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('stores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('accounts').delete().neq('username', 'admin');

    // 2. Roles
    const rolesData = [
      { role_key: 'admin', role_name: 'Quản trị hệ thống', description: 'Cấu hình và quản trị toàn bộ hệ thống' },
      { role_key: 'owner', role_name: 'Chủ cửa hàng', description: 'Toàn quyền quản lý cửa hàng (sản phẩm, đơn hàng, kho, giao hàng, voucher)' },
      { role_key: 'customer', role_name: 'Khách hàng', description: 'Mua sắm và đặt hàng' },
    ];

    for (const r of rolesData) {
      const { data: existing } = await supabase.from('roles').select('id').eq('role_key', r.role_key).maybeSingle();
      if (!existing) {
        await supabase.from('roles').insert(r);
      }
    }

    // 3. Keep/Create ONLY 1 Admin Account
    const defaultPassword = hashPassword('123456');
    let { data: adminUser } = await supabase.from('accounts').select('*').eq('username', 'admin').maybeSingle();

    if (!adminUser) {
      const { data: inserted } = await supabase.from('accounts').insert({
        username: 'admin',
        password: defaultPassword,
        role: 'admin',
        fullname: 'Quản Trị Hệ Thống',
        email: 'admin@glassvault.vn',
        phone: '0901234567',
        address: 'Hà Nội',
        active: true,
      }).select().single();
      adminUser = inserted;
    } else {
      // Ensure role is admin & active
      await supabase.from('accounts').update({ role: 'admin', active: true }).eq('id', adminUser.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Đã dọn dẹp sạch toàn bộ dữ liệu mẫu. Chỉ giữ lại duy nhất 1 tài khoản admin (admin / 123456)!',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
