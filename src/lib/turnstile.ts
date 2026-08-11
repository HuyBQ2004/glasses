export async function verifyTurnstileToken(token: string | null | undefined, remoteIp?: string): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';

  // If testing key is used or no token provided in dev environment
  if (!token) {
    if (process.env.NODE_ENV === 'development' || !process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY) {
      return { success: true };
    }
    return { success: false, error: 'Vui lòng hoàn thành xác thực Cloudflare Turnstile để chống Bot / DDoS' };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) formData.append('remoteip', remoteIp);

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const outcome: any = await res.json();
    if (outcome.success) {
      return { success: true };
    }

    return {
      success: false,
      error: 'Xác thực Cloudflare Turnstile thất bại hoặc hết hạn. Vui lòng thử lại!',
    };
  } catch (err: any) {
    console.error('[Cloudflare Turnstile Error]', err.message);
    // Graceful fallback if Cloudflare API is temporarily unreachable
    return { success: true };
  }
}
