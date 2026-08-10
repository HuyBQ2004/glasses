import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*, cateID:categories(id, cname, manufacturer)')
      .eq('id', id)
      .single();

    if (productError || !product) {
      return NextResponse.json({ success: false, error: 'Sản phẩm không tồn tại' }, { status: 404 });
    }

    const { data: feedbacks } = await supabase
      .from('feedbacks')
      .select('*, account:accounts(id, fullname, username)')
      .eq('product_id', id)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false });

    return NextResponse.json({ success: true, product, feedbacks: feedbacks || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
      return NextResponse.json({ success: false, error: 'Quyền truy cập bị từ chối' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const updatePayload: any = { ...body };
    if (updatePayload.cateID) {
      updatePayload.cate_id = updatePayload.cateID;
      delete updatePayload.cateID;
    }

    const { data: updated, error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
      return NextResponse.json({ success: false, error: 'Quyền truy cập bị từ chối' }, { status: 403 });
    }

    const { id } = await params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Đã xóa sản phẩm' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
