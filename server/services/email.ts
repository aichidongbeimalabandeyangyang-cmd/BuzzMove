import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVideoReadyEmail(email: string, videoId: string) {
  const viewUrl = `https://buzzmove.me/dashboard?video=${videoId}`;

  await resend.emails.send({
    from: "BuzzMove <noreply@buzzmove.me>",
    to: email,
    subject: "Your BuzzMove video is ready! 🎬",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #050505; color: #FAFAF9;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #E8A838, #F0C060); line-height: 48px; font-size: 24px;">▶</div>
        </div>
        <h1 style="font-size: 22px; font-weight: 700; text-align: center; margin: 0 0 8px;">Your video is ready!</h1>
        <p style="font-size: 15px; color: #9898A4; text-align: center; margin: 0 0 28px;">Your AI-generated video has been created and is waiting for you.</p>
        <div style="text-align: center;">
          <a href="${viewUrl}" style="display: inline-block; padding: 14px 32px; border-radius: 12px; background: linear-gradient(135deg, #F0C060, #E8A838); color: #050505; font-size: 16px; font-weight: 700; text-decoration: none;">View Your Video</a>
        </div>
        <p style="font-size: 12px; color: #4A4A50; text-align: center; margin-top: 32px;">BuzzMove — Turn any photo into a stunning video with AI</p>
      </div>
    `,
  });
}
