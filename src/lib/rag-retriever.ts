import { supabase } from '@/lib/supabase';

export interface ProductItem {
  id: string | number;
  name: string;
  title?: string;
  description?: string;
  price: number;
  image?: string;
  manufacturer?: string;
  quantity?: number;
  cate_id?: number | string;
}

// 1. Kiến thức chuyên ngành Kính mắt (Eyewear Domain Knowledge Base)
const EYEWEAR_KNOWLEDGE_BASE = [
  {
    topic: 'Khuôn mặt tròn (Round Face)',
    keywords: ['mặt tròn', 'tron', 'round'],
    advice: 'Nên chọn gọng kính hình vuông, chữ nhật, hoặc gọng góc cạnh (Cat-eye, Wayfarer) để làm khuôn mặt thon gọn, cân đối hơn. Tránh chọn kính gọng tròn hoặc quá nhỏ.',
  },
  {
    topic: 'Khuôn mặt vuông (Square Face)',
    keywords: ['mặt vuông', 'vuong', 'square'],
    advice: 'Nên chọn gọng kính tròn, oval, hình giọt nước (Aviator) hoặc gọng kính cong nhẹ với đường viền mỏng để làm mềm các góc cạnh gò má và quai hàm. Tránh kính gọng vuông vức.',
  },
  {
    topic: 'Khuôn mặt trái xoan (Oval Face)',
    keywords: ['trái xoan', 'trai xoan', 'oval'],
    advice: 'Khuôn mặt chuẩn tỉ lệ nhất, phù hợp với hầu hết các dáng gọng kính từ vuông, tròn, Aviator đến Cat-eye. Nên chọn kính có chiều rộng bằng hoặc rộng hơn phần rộng nhất của khuôn mặt.',
  },
  {
    topic: 'Khuôn mặt dài / Chữ nhật (Long Face)',
    keywords: ['mặt dài', 'dai', 'long face'],
    advice: 'Nên chọn gọng kính có tròng to, gọng vuông hoặc tròn bản to, hoặc gọng có đường viền đậm nét để rút ngắn chiều dài khuôn mặt.',
  },
  {
    topic: 'Khuôn mặt Trái tim / Kim cương (Heart/Diamond Face)',
    keywords: ['trái tim', 'kim cương', 'kim cuong', 'heart'],
    advice: 'Nên chọn gọng kính mắt mèo (Cat-eye), gọng kính tròn nhẹ hoặc gọng không viền (rimless) giúp tôn lên xương gò má và cân đối cằm thon.',
  },
  {
    topic: 'Chất liệu Titanium (Titanium Frames)',
    keywords: ['titan', 'titanium', 'siêu nhẹ', 'sieu nhe'],
    advice: 'Gọng kính Titanium nổi tiếng siêu nhẹ, siêu bền, không bị oxy hóa, chống dị ứng da và tạo cảm giác đeo cực kỳ thoải mái suốt ngày dài.',
  },
  {
    topic: 'Chất liệu Acetate (Acetate Frames)',
    keywords: ['acetate', 'nhựa cao cấp', 'nhua cao cap'],
    advice: 'Gọng nhựa Acetate dẻo dai, màu sắc thời trang, bóng đẹp, độ bền cao và dễ dàng điều chỉnh độ ôm theo dáng tai người đeo.',
  },
  {
    topic: 'Công nghệ Tròng kính (Lens Coatings & Tech)',
    keywords: ['ánh sáng xanh', 'blue cut', 'uv400', 'uv 400', 'đổi màu', 'doi mau', 'phân cực', 'polaroid'],
    advice: 'Tròng kính BlueCut chống ánh sáng xanh màn hình máy tính/điện thoại giúp giảm mỏi mắt. Tròng UV400 bảo vệ mắt khỏi 99-100% tia cực tím mặt trời. Tròng kính râm phân cực (Polarized) giúp chống chói lóa khi đi đường nắng.',
  },
];

export interface RAGResult {
  contextText: string;
  matchedProducts: ProductItem[];
  knowledgeTopics: string[];
}

/**
 * Hàm RAG Retrieval: Tìm kiếm thông tin sản phẩm và kiến thức tư vấn kính mắt từ database Supabase
 */
export async function retrieveEyewearContext(userQuery: string): Promise<RAGResult> {
  const queryLower = userQuery.toLowerCase().trim();
  const matchedProducts: ProductItem[] = [];
  const knowledgeTopics: string[] = [];

  // A. Match Kiến thức Chuyên môn Kính mắt dựa trên Keyword
  const relevantAdviceList: string[] = [];
  for (const item of EYEWEAR_KNOWLEDGE_BASE) {
    const isMatched = item.keywords.some((kw) => queryLower.includes(kw));
    if (isMatched) {
      knowledgeTopics.push(item.topic);
      relevantAdviceList.push(`- **${item.topic}**: ${item.advice}`);
    }
  }

  // B. Parse mức giá từ query (VD: "dưới 1 triệu", "dưới 500k", "từ 1tr đến 2tr")
  let maxPrice: number | null = null;
  const minPrice: number | null = null;


  if (queryLower.includes('dưới 500k') || queryLower.includes('duoi 500k') || queryLower.includes('< 500k')) {
    maxPrice = 500000;
  } else if (queryLower.includes('dưới 1 triệu') || queryLower.includes('duoi 1 trieu') || queryLower.includes('dưới 1tr')) {
    maxPrice = 1000000;
  } else if (queryLower.includes('dưới 2 triệu') || queryLower.includes('duoi 2 trieu') || queryLower.includes('dưới 2tr')) {
    maxPrice = 2000000;
  } else if (queryLower.includes('dưới 3 triệu') || queryLower.includes('duoi 3 trieu') || queryLower.includes('dưới 3tr')) {
    maxPrice = 3000000;
  }

  // C. Query Sản phẩm từ Database Supabase (Retrieval Step)
  try {
    let query = supabase.from('products').select('*');

    // Tự động trích xuất các từ khóa sản phẩm chính
    const searchTerms: string[] = [];
    const brands = ['ray-ban', 'rayban', 'gentle monster', 'oakley', 'gucci', 'tom ford', 'bolon', 'parim'];
    const types = ['râm', 'ram', 'cận', 'can', 'titan', 'thời trang', 'thoi trang', 'mắt mèo', 'cat eye', 'aviator', 'tròn', 'tron', 'vuông', 'vuong'];

    for (const b of brands) {
      if (queryLower.includes(b)) searchTerms.push(b);
    }
    for (const t of types) {
      if (queryLower.includes(t)) searchTerms.push(t);
    }

    if (searchTerms.length > 0) {
      const orFilter = searchTerms.map((term) => `name.ilike.%${term}%,title.ilike.%${term}%,description.ilike.%${term}%`).join(',');
      query = query.or(orFilter);
    }

    if (maxPrice !== null) {
      query = query.lte('price', maxPrice);
    }
    if (minPrice !== null) {
      query = query.gte('price', minPrice);
    }

    query = query.limit(8);

    const { data: dbProducts, error } = await query;

    if (!error && dbProducts && dbProducts.length > 0) {
      matchedProducts.push(...dbProducts);
    } else {
      // Fallback: nếu không filter ra kết quả cụ thể nào, lấy 6 sản phẩm nổi bật ngẫu nhiên để tư vấn
      const { data: fallbackProducts } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (fallbackProducts) {
        matchedProducts.push(...fallbackProducts);
      }
    }
  } catch (err) {
    console.error('Lỗi khi RAG retrieve sản phẩm từ Supabase:', err);
  }

  // D. Tổng hợp Ngữ cảnh (RAG Context Construction)
  let contextText = `=== DỮ LIỆU TƯ VẤN KÍNH MẮT GLASSVAULT (RAG RETRIEVED CONTEXT) ===\n\n`;

  if (relevantAdviceList.length > 0) {
    contextText += `--- HƯỚNG DẪN DÁNG MẶT & CHẤT LIỆU PHÙ HỢP ---\n`;
    contextText += relevantAdviceList.join('\n') + `\n\n`;
  }

  contextText += `--- SAN PHAM TRONG KHO HANG GLASSVAULT PHÙ HỢP CHẤT LƯỢNG ---\n`;
  if (matchedProducts.length > 0) {
    matchedProducts.forEach((p, idx) => {
      const priceVND = p.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price) : 'Liên hệ';
      contextText += `${idx + 1}. [ID: ${p.id}] Tên: ${p.name} | Giá: ${priceVND} | Hãng: ${p.manufacturer || 'GlassVault'} | Mô tả: ${p.title || p.description || 'Kính mắt chính hãng'}\n`;
    });
  } else {
    contextText += `Hiện chưa tìm thấy sản phẩm trùng khớp tuyệt đối, hãy gợi ý khách hàng tham khảo thêm trên website GlassVault.\n`;
  }

  return {
    contextText,
    matchedProducts,
    knowledgeTopics,
  };
}
