import nodemailer from "nodemailer";

const GMAIL_USER = process.env.EMAIL_USER || "pratikkhode1122@gmail.com";
const GMAIL_PASS = (process.env.EMAIL_PASS || "mqkg fjfb qbpk tejl").replace(/\s+/g, "");

export default async function handler(req, res) {
  // Allow CORS for backend requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { email, otp, subject, html } = req.body || {};

  if (!email || (!otp && !html)) {
    return res.status(400).json({ success: false, error: "Missing email or content" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_USER.trim(),
        pass: GMAIL_PASS
      }
    });

    const defaultHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 500px; margin: 40px auto; padding: 0; border: 1px solid #e5e7eb; border-radius: 20px; overflow: hidden; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
        <div style="background-color: #0D9488; padding: 40px 20px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -1px;">Skill Predictor</h2>
          <p style="color: rgba(255,255,255,0.9); font-size: 11px; margin: 8px 0 0 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Secure Authentication Engine</p>
        </div>
        
        <div style="padding: 40px 35px; text-align: left;">
          <h3 style="color: #111827; font-size: 18px; font-weight: 800; margin: 0 0 15px 0; text-align: center;">Verification Required</h3>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0; text-align: center;">
            Please use the authorization code below to complete your identity verification process. This code is unique to your session.
          </p>
          
          <div style="background: #f8fafc; padding: 30px; text-align: center; border-radius: 16px; margin: 30px 0; border: 1px solid #f1f5f9;">
            <h1 style="letter-spacing: 12px; color: #0D9488; margin: 0; font-size: 42px; font-weight: 900; font-family: 'Courier New', Courier, monospace; display: inline-block;">${otp}</h1>
          </div>
          
          <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9;">
            This code will automatically expire in <span style="color: #ef4444; font-weight: 800;">5 minutes</span>.
          </p>
          
          <div style="margin-top: 30px; text-align: center;">
            <p style="color: #9ca3af; font-size: 11px; line-height: 1.6; margin: 0;">
              If you did not initiate this request, please contact our security team immediately. Do not share this code with anyone.
            </p>
          </div>
        </div>
        
        <div style="background: #fcfcfc; padding: 25px; text-align: center; border-top: 1px solid #f1f5f9;">
          <p style="color: #94a3b8; font-size: 10px; margin: 0; line-height: 1.8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
            © 2026 Skill Predictor AI • Pune, Maharashtra, India.
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Skill Predictor Security" <${GMAIL_USER.trim()}>`,
      to: email,
      subject: subject || "Verification Code - Skill Predictor Security",
      html: html || defaultHtml
    });

    console.log(`[Vercel Serverless Mailer] Sent to ${email}: ${info.messageId}`);
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("[Vercel Serverless Mailer] Error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
