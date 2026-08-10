import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const categoryId = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort'); // 'price_asc' | 'price_desc' | 'newest'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;

    let query = supabase
      .from('products')
      .select('*, cateID:categories(id, cname, manufacturer)');

    if (categoryId) {
      query = query.eq('cate_id', categoryId);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,title.ilike.%${search}%,manufacturer.ilike.%${search}%`);
    }

    if (minPrice) {
      query = query.gte('price', Number(minPrice));
    }
    if (maxPrice) {
      query = query.lte('price', Number(maxPrice));
    }

    if (sort === 'price_asc') {
      query = query.order('price', { ascending: true });
    } else if (sort === 'price_desc') {
      query = query.order('price', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    query = query.limit(limit);

    const { data: products, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, products: products || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
      return NextResponse.json({ success: false, error: 'Bạn không có quyền thực hiện thao tác này' }, { status: 403 });
    }

    const data = await req.json();

    const insertData: any = {
      name: data.name,
      image: data.image,
      price: data.price,
      title: data.title,
      description: data.description,
      cate_id: data.cateID || data.cate_id,
      quantity: data.quantity || 0,
      sell_id: user.id,
      store_id: data.store_id,
      manufacturer: data.manufacturer || 'Nike / Adidas',
    };

    const { data: newProduct, error } = await supabase
      .from('products')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
