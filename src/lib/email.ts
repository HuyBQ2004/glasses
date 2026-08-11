import nodemailer from 'nodemailer';

interface SendActivationEmailOptions {
  to: string;
  username: string;
  token: string;
  appUrl: string;
}

export async function sendActivationEmail({ to, username, token, appUrl }: SendActivationEmailOptions) {
  const activationUrl = `${appUrl}/verify-email?token=${token}&username=${encodeURIComponent(username)}`;

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `GLASSVAULT Eyewear <${smtpUser}>`,
        to,
        subject: '👓 Kích Hoạt Tài Khoản GLASSVAULT Eyewear',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #09090b; color: #ffffff; border-radius: 20px; border: 1px solid #27272a;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 32px;">👓</span>
              <h2 style="color: #f59e0b; margin: 8px 0 0 0;">GLASSVAULT Eyewear</h2>
            </div>
            <h3 style="text-align: center; color: #ffffff; margin-bottom: 16px;">Kích Hoạt Tài Khoản Mới</h3>
            <p style="color: #e4e4e7; line-height: 1.6;">Xin chào <strong>${username}</strong>,</p>
            <p style="color: #a1a1aa; line-height: 1.6;">Cảm ơn bạn đã đăng ký tài khoản tại <strong>GLASSVAULT Luxury Eyewear Boutique</strong>. Vui lòng nhấp vào nút bên dưới để kích hoạt tài khoản của bạn:</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${activationUrl}" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #09090b; padding: 14px 32px; font-weight: bold; border-radius: 12px; text-decoration: none; display: inline-block; font-size: 15px;">Kích Hoạt Tài Khoản Ngay</a>
            </div>
            <p style="font-size: 12px; color: #71717a; line-height: 1.5;">Nếu nút trên không hoạt động, bạn có thể truy cập liên kết sau: <br/><a href="${activationUrl}" style="color: #f59e0b; word-break: break-all;">${activationUrl}</a></p>
            <hr style="border: 0; border-top: 1px solid #27272a; margin: 28px 0 16px 0;" />
            <p style="font-size: 11px; color: #71717a; text-align: center;">Trân trọng,<br/>Đội ngũ GLASSVAULT Eyewear 2026</p>
          </div>
        `,
      });

      console.log(`[Email] Activation email successfully sent to ${to}`);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Email Error] Failed to send activation email via SMTP:', msg);
    }
  }

  // Development Fallback Log
  console.log('====================================================');
  console.log(`[DEV ACTIVATION EMAIL LINK] To: ${to}`);
  console.log(`Activation Link: ${activationUrl}`);
  console.log('====================================================');
  return true;
}

interface SendResetPasswordEmailOptions {
  to: string;
  username: string;
  token: string;
  appUrl: string;
}

export async function sendResetPasswordEmail({ to, username, token, appUrl }: SendResetPasswordEmailOptions) {
  const resetUrl = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(to)}`;

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `GLASSVAULT Eyewear <${smtpUser}>`,
        to,
        subject: '🔒 Khôi Phục Mật Khẩu Tài Khoản GLASSVAULT Eyewear',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #09090b; color: #ffffff; border-radius: 20px; border: 1px solid #27272a;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 32px;">👓</span>
              <h2 style="color: #f59e0b; margin: 8px 0 0 0;">GLASSVAULT Eyewear</h2>
            </div>
            <h3 style="text-align: center; color: #ffffff; margin-bottom: 16px;">Yêu Cầu Khôi Phục Mật Khẩu</h3>
            <p style="color: #e4e4e7; line-height: 1.6;">Xin chào <strong>${username}</strong>,</p>
            <p style="color: #a1a1aa; line-height: 1.6;">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với Email <strong>${to}</strong>. Vui lòng nhấp vào nút bên dưới để tạo mật khẩu mới:</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #09090b; padding: 14px 32px; font-weight: bold; border-radius: 12px; text-decoration: none; display: inline-block; font-size: 15px;">Đặt Lại Mật Khẩu Ngay</a>
            </div>
            <p style="font-size: 12px; color: #71717a; line-height: 1.5;">Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua Email này. Liên kết có hiệu lực trong vòng 24 giờ.<br/><a href="${resetUrl}" style="color: #f59e0b; word-break: break-all;">${resetUrl}</a></p>
            <hr style="border: 0; border-top: 1px solid #27272a; margin: 28px 0 16px 0;" />
            <p style="font-size: 11px; color: #71717a; text-align: center;">Trân trọng,<br/>Đội ngũ GLASSVAULT Eyewear 2026</p>
          </div>
        `,
      });

      console.log(`[Email] Password reset email successfully sent to ${to}`);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Email Error] Failed to send reset email via SMTP:', msg);
    }
  }

  // Development Fallback Log
  console.log('====================================================');
  console.log(`[DEV RESET PASSWORD EMAIL LINK] To: ${to}`);
  console.log(`Reset Password Link: ${resetUrl}`);
  console.log('====================================================');
  return true;
}
