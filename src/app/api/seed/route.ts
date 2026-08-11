import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    // 1. Clear all data tables
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
    await supabase.from('accounts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Insert Default System Roles
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

    // 3. Keep ONLY Admin & Owner Accounts
    const defaultPassword = hashPassword('123456');
    await supabase.from('accounts').insert([
      {
        username: 'admin',
        password: defaultPassword,
        role: 'admin',
        fullname: 'Quản Trị Hệ Thống',
        email: 'admin@glassvault.vn',
        phone: '0901234567',
        address: 'Hà Nội',
        active: true,
      },
      {
        username: 'owner',
        password: defaultPassword,
        role: 'owner',
        fullname: 'Chủ Cửa Hàng GLASSVAULT',
        email: 'owner@glassvault.vn',
        phone: '0988888888',
        address: 'TP. Hồ Chí Minh',
        active: true,
      },
    ]);

    return NextResponse.json({
      success: true,
      message: 'Xóa toàn bộ dữ liệu thành công! Chỉ giữ lại duy nhất 2 tài khoản: admin (admin/123456) và owner (owner/123456).',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
