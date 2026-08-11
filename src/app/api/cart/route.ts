import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select('*, product:products(*, cateID:categories(cname))')
      .eq('account_id', user.id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Map response so product_id returns populated product object for UI compatibility
    const formattedCart = (cartItems || []).map((item: Record<string, unknown>) => {
      const productObj = item.product as Record<string, unknown> | null;
      return {
        _id: item.id,
        id: item.id,
        account_id: item.account_id,
        product_id: productObj ? {
          ...productObj,
          _id: productObj.id
        } : item.product_id,
        amount: item.amount,
        reserved_at: item.reserved_at,
        expires_at: item.expires_at
      };
    });

    return NextResponse.json({ success: true, cart: formattedCart });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ' }, { status: 401 });
    }

    const { productId, amount = 1 } = await req.json();
    if (!productId) {
      return NextResponse.json({ success: false, error: 'Thiếu thông tin sản phẩm' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('cart_items')
      .select('*')
      .eq('account_id', user.id)
      .eq('product_id', productId)
      .maybeSingle();

    let cartItem;
    if (existing) {
      const newAmount = existing.amount + amount;
      const { data: updated, error } = await supabase
        .from('cart_items')
        .update({ amount: newAmount })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      cartItem = updated;
    } else {
      const expires = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
      const { data: inserted, error } = await supabase
        .from('cart_items')
        .insert({
          account_id: user.id,
          product_id: productId,
          amount,
          reserved_at: new Date().toISOString(),
          expires_at: expires,
        })
        .select()
        .single();
      if (error) throw error;
      cartItem = inserted;
    }

    return NextResponse.json({ success: true, cartItem });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { productId, amount } = await req.json();

    if (amount <= 0) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('account_id', user.id)
        .eq('product_id', productId);
      return NextResponse.json({ success: true, message: 'Đã xóa sản phẩm khỏi giỏ' });
    }

    const { data: updated, error } = await supabase
      .from('cart_items')
      .update({ amount })
      .eq('account_id', user.id)
      .eq('product_id', productId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, cartItem: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (productId) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('account_id', user.id)
        .eq('product_id', productId);
    } else {
      await supabase
        .from('cart_items')
        .delete()
        .eq('account_id', user.id);
    }

    return NextResponse.json({ success: true, message: 'Đã cập nhật giỏ hàng' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
