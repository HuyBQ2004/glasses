import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    let query = supabase
      .from('feedbacks')
      .select('*, account:accounts(id, fullname, username), product:products(id, name, image)')
      .order('create_date', { ascending: false });

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data: feedbacks, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const formattedFeedbacks = (feedbacks || []).map((fb: Record<string, unknown>) => {
      const acc = fb.account as Record<string, unknown> | null;
      const prod = fb.product as Record<string, unknown> | null;
      return {
        ...fb,
        _id: fb.id,
        account_id: acc ? { ...acc, _id: acc.id } : fb.account_id,
        product_id: prod ? { ...prod, _id: prod.id } : fb.product_id,
      };
    });

    return NextResponse.json({ success: true, feedbacks: formattedFeedbacks });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Vui lòng đăng nhập để gửi nhận xét' }, { status: 401 });
    }

    const { productId, rating, content } = await req.json();
    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: 'Đánh giá rating từ 1 đến 5 sao' }, { status: 400 });
    }

    const { data: stores } = await supabase.from('stores').select('*').limit(1);
    const store = stores && stores.length > 0 ? stores[0] : null;

    const { data: feedback, error } = await supabase
      .from('feedbacks')
      .insert({
        account_id: user.id,
        product_id: productId,
        store_id: store?.id || null,
        rating,
        content,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, feedback: { ...feedback, _id: feedback.id } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
