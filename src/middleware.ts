import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Sliding Window In-Memory Rate Limiter Map for Anti-DDoS
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const path = request.nextUrl.pathname;

  // 1. Apply Cloudflare & Anti-DDoS Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Attach Cloudflare Ray ID header if not present
  if (!request.headers.get('cf-ray')) {
    const fakeCfRay = `cf-${Math.random().toString(36).substring(2, 12)}-HAN`;
    response.headers.set('CF-RAY', fakeCfRay);
  }

  // 2. HTTP Flood DDoS Protection & Rate Limiting for API routes
  if (path.startsWith('/api/')) {
    const ip =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequestsPerWindow = 60; // Max 60 API requests per minute per IP

    const clientRate = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > clientRate.resetTime) {
      clientRate.count = 1;
      clientRate.resetTime = now + windowMs;
    } else {
      clientRate.count += 1;
    }

    rateLimitMap.set(ip, clientRate);

    // If rate limit exceeded, block request (DDoS Prevention)
    if (clientRate.count > maxRequestsPerWindow) {
      console.warn(`[Anti-DDoS Rate Limit Exceeded] IP: ${ip} sent ${clientRate.count} requests to ${path}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Phát hiện lưu lượng truy cập bất thường (HTTP Flood / DDoS). Vui lòng thử lại sau 1 phút.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': maxRequestsPerWindow.toString(),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    response.headers.set('X-RateLimit-Limit', maxRequestsPerWindow.toString());
    response.headers.set(
      'X-RateLimit-Remaining',
      Math.max(0, maxRequestsPerWindow - clientRate.count).toString()
    );
  }

  return response;
}

// Apply middleware to API routes and page requests
export const config = {
  matcher: ['/api/:path*', '/login', '/signup', '/forgot-password', '/checkout', '/dashboard/:path*'],
};
