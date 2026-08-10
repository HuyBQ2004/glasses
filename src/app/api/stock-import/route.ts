import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'warehouse_manager') {
      return NextResponse.json({ success: false, error: 'Chỉ có Quản lý kho (Warehouse Manager) mới được xem lịch sử nhập kho' }, { status: 403 });
    }

    const { data: imports, error } = await supabase
      .from('stock_imports')
      .select('*, product:products(id, name, image, price, quantity), creator:accounts(id, fullname, username)')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const formattedImports = (imports || []).map((imp: any) => ({
      ...imp,
      _id: imp.id,
      product_id: imp.product ? { ...imp.product, _id: imp.product.id } : imp.product_id,
      created_by: imp.creator ? { ...imp.creator, _id: imp.creator.id } : imp.created_by,
    }));

    return NextResponse.json({ success: true, imports: formattedImports });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'warehouse_manager') {
      return NextResponse.json({ success: false, error: 'Chỉ có Quản lý kho (Warehouse Manager) mới được thực hiện nhập kho' }, { status: 403 });
    }

    const { productId, importQuantity, note } = await req.json();
    if (!productId || !importQuantity || importQuantity <= 0) {
      return NextResponse.json({ success: false, error: 'Số lượng nhập không hợp lệ' }, { status: 400 });
    }

    const { data: stores } = await supabase.from('stores').select('*').limit(1);
    const store = stores && stores.length > 0 ? stores[0] : null;

    const { data: stockImport, error: importError } = await supabase
      .from('stock_imports')
      .insert({
        product_id: productId,
        store_id: store?.id || null,
        import_quantity: importQuantity,
        note,
        created_by: user.id,
      })
      .select()
      .single();

    if (importError) {
      return NextResponse.json({ success: false, error: importError.message }, { status: 500 });
    }

    // Get current product stock
    const { data: prod } = await supabase.from('products').select('quantity').eq('id', productId).single();
    const currentQty = prod?.quantity || 0;

    // Increase product quantity
    await supabase
      .from('products')
      .update({ quantity: currentQty + Number(importQuantity) })
      .eq('id', productId);

    return NextResponse.json({ success: true, stockImport, message: 'Nhập kho thành công!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
