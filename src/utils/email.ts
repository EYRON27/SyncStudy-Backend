import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Sends a styled OTP verification email to the user
 */
export async function sendOtpEmail(email: string, code: string, name: string) {
  const { data, error } = await resend.emails.send({
    from: 'SyncStudy <onboarding@resend.dev>', // Change to your domain after verifying with Resend
    to: email,
    subject: `Your SyncStudy verification code: ${code}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background:#0f1015;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <div style="max-width:480px;margin:40px auto;padding:0 20px;">
            <div style="background:#1a1b24;border:1px solid #2a2d3c;border-radius:20px;overflow:hidden;">
              
              <!-- Header -->
              <div style="background:linear-gradient(135deg,#ff8c37,#e65c00);padding:32px 40px;text-align:center;">
                <div style="width:48px;height:48px;background:rgba(255,255,255,0.2);border-radius:12px;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:white;line-height:48px;">S</div>
                <h1 style="color:white;font-size:22px;font-weight:700;margin:0;">Verify your email</h1>
              </div>

              <!-- Body -->
              <div style="padding:36px 40px;">
                <p style="color:#9ca3af;font-size:15px;margin:0 0 8px;">Hi ${name},</p>
                <p style="color:#d1d5db;font-size:15px;margin:0 0 28px;line-height:1.6;">
                  Enter the code below to verify your SyncStudy account. This code expires in <strong style="color:white;">10 minutes</strong>.
                </p>

                <!-- OTP Code Box -->
                <div style="background:#13141a;border:1px solid #2a2d3c;border-radius:14px;padding:28px;text-align:center;margin-bottom:28px;">
                  <div style="letter-spacing:12px;font-size:36px;font-weight:900;color:white;font-family:monospace;">
                    ${code}
                  </div>
                </div>

                <p style="color:#6b7280;font-size:13px;margin:0;text-align:center;">
                  If you didn't create a SyncStudy account, you can safely ignore this email.
                </p>
              </div>

              <!-- Footer -->
              <div style="border-top:1px solid #2a2d3c;padding:20px 40px;text-align:center;">
                <p style="color:#4b5563;font-size:12px;margin:0;">© 2025 SyncStudy · Built for students</p>
              </div>

            </div>
          </div>
        </body>
      </html>
    `,
  })

  if (error) {
    console.error('❌ Resend API Error:', error)
  } else {
    console.log('✅ OTP Email sent successfully:', data)
  }
}
