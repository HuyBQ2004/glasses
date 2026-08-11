import { NextResponse } from 'next/server';
import { retrieveEyewearContext } from '@/lib/rag-retriever';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Chưa cấu hình GEMINI_API_KEY trong môi trường (.env.local)',
        },
        { status: 500 }
      );
    }

    const { message, history } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'Tin nhắn không hợp lệ' }, { status: 400 });
    }

    // 1. RAG Retrieval Step: Lấy ngữ cảnh sản phẩm & tri thức kính mắt
    const ragData = await retrieveEyewearContext(message);

    // 2. System Instruction nghiêm ngặt về tư vấn Kính mắt & Giới hạn phạm vi
    const systemInstructionText = `
Bạn là "Chuyên gia Tư vấn Kính Mắt GlassVault" (GLASSVAULT AI Eyewear Consultant) - trợ lý tư vấn cao cấp chuyên nghiệp, nhiệt tình và am hiểu sâu sắc về thế giới kính mắt.

QUY TẮC NGHIÊM NGẶT VỀ PHẠM VI TƯ VẤN (STRICT SCOPE CONTROL):
1. BẠN CHỈ ĐƯỢC PHÉP TRẢ LỜI CÁC CÂU HỎI LIÊN QUAN ĐẾN KÍNH MẮT, GỌNG KÍNH, KÍNH RÂM, TRÒNG KÍNH, TƯ VẤN CHỌN KÍNH THEO DÁNG MẶT, CHĂM SÓC BẢO VỆ MẮT VÀ CÁC SẢN PHẨM CỦA CỬA HÀNG GLASSVAULT.
2. NẾU NGƯỜI DÙNG HỎI BẤT KỲ CÂU HỎI NÀO KHÔNG LIÊN QUAN ĐẾN KÍNH MẮT (Ví dụ: lập trình code, viết văn, ẩm thực, giải toán, dự báo thời tiết, tin tức chính trị, thiết bị điện tử, giày dép khác...), BẠN BẮT BUỘC PHẢI TỪ CHỐI LỊCH SỰ BẰNG TIẾNG VIỆT VÀ HƯỚNG NGƯỜI DÙNG QUAY LẠI CHỦ ĐỀ KÍNH MẮT.
   Mẫu từ chối: "Dạ xin lỗi bạn, em là Chuyên gia AI Tư vấn Kính Mắt của GlassVault ạ! 👓 Em chỉ có thể hỗ trợ giải đáp các câu hỏi liên quan đến kính mắt, gọng kính, kính râm, tư vấn chọn gọng theo khuôn mặt và các sản phẩm của GlassVault thôi ạ. Bạn có muốn em giúp chọn mẫu gọng kính hay kính râm nào phù hợp không ạ?"

QUY TẮC TƯ VẤN KÍNH MẮT:
- Xưng xưng hô thân thiện, lịch sự: "Dạ em chào anh/chị", "GlassVault tư vấn đến bạn...", sử dụng emoji 👓, 🕶️, ✨ linh hoạt.
- Sử dụng dữ liệu RAG dưới đây để trả lời chính xác thông tin sản phẩm (Tên kính, Giá cả, Chất liệu, Thương hiệu). KHÔNG BỊA ĐẶT SẢN PHẨM KHÔNG CÓ TRONG KHO.
- Nếu người dùng hỏi chọn kính theo dáng mặt (tròn, vuông, dài, trái xoan...), đưa ra lời khuyên chuyên môn rõ ràng và gợi ý các mẫu kính tương ứng trong danh sách RAG.

${ragData.contextText}
`;

    // 3. Format tin nhắn cho Gemini API (Gemini v1beta generateContent)
    const contents: any[] = [];

    // Thêm lịch sử hội thoại nếu có (tối đa 6 tin nhắn gần nhất để giữ context)
    if (Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-6);
      for (const item of recentHistory) {
        if (item.role === 'user' || item.role === 'model') {
          contents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.content }],
          });
        }
      }
    }

    // Thêm câu hỏi hiện tại của người dùng
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // Request payload tới Gemini 2.5 Flash / 1.5 Flash API
    const geminiRequestBody = {
      systemInstruction: {
        parts: [{ text: systemInstructionText }],
      },
      contents: contents,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1000,
      },
    };

    // Gọi Gemini API (thử gemini-2.5-flash trước, nếu fallback sang gemini-1.5-flash)
    let response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiRequestBody),
      }
    );

    if (!response.ok) {
      // Fallback endpoint
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiRequestBody),
        }
      );
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error('Lỗi Gemini API:', errText);
      return NextResponse.json(
        {
          success: false,
          error: `Không thể kết nối Gemini API. Vui lòng kiểm tra lại API Key hoặc hạn ngạch sử dụng. (${response.status})`,
        },
        { status: 500 }
      );
    }

    const geminiData = await response.json();
    const answerText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Dạ xin lỗi bạn, em hiện chưa xử lý được phản hồi. Bạn có thể hỏi lại được không ạ?';

    // 4. Trả về cho Client câu trả lời AI + Danh sách sản phẩm RAG gợi ý đính kèm
    return NextResponse.json({
      success: true,
      answer: answerText,
      products: ragData.matchedProducts.slice(0, 4), // Trả về tối đa 4 sản phẩm gợi ý hiển thị card
      knowledgeTopics: ragData.knowledgeTopics,
    });
  } catch (error: any) {
    console.error('API /api/ai/chat Exception:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi hệ thống khi kết nối AI' },
      { status: 500 }
    );
  }
}
