import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Chỉ có System Admin mới được quản lý tài khoản nhân viên' }, { status: 403 });
    }

    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('id, username, role, active, fullname, phone, email, address, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const formattedAccounts = (accounts || []).map((acc: Record<string, unknown>) => ({
      ...acc,
      _id: acc.id
    }));

    return NextResponse.json({ success: true, accounts: formattedAccounts });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Chỉ có System Admin mới được cập nhật phân quyền nhân viên' }, { status: 403 });
    }

    const { id, role, active } = await req.json();

    const { data: updated, error } = await supabase
      .from('accounts')
      .update({ role, active })
      .eq('id', id)
      .select('id, username, role, active, fullname, phone, email, address')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, account: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
