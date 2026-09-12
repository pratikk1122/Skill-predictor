const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
const nodemailer = require("nodemailer");

/* ================= 🚀 OPTIMIZED EMAIL TRANSPORTERS ================= */
const DEFAULT_EMAIL_USER = "pratikkhode1122@gmail.com";
const DEFAULT_EMAIL_PASS = "mqkg fjfb qbpk tejl";

const getCleanEmailPass = () => {
  const pass = process.env.EMAIL_PASS || "mqkg fjfb qbpk tejl";
  return pass.replace(/\s+/g, "");
};

// Custom DNS lookup to strictly enforce IPv4 (prevents ENETUNREACH on Render/cloud Linux)
const ipv4Lookup = (hostname, options, callback) => {
  dns.lookup(hostname, { family: 4 }, callback);
};

// 1️⃣ Primary: Port 587 (STARTTLS) with IPv4 lookup
const createPort587Transporter = () => {
  const user = (process.env.EMAIL_USER || "pratikkhode1122@gmail.com").trim();
  const pass = getCleanEmailPass();
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Must be false for 587 STARTTLS
    requireTLS: true,
    family: 4,
    lookup: ipv4Lookup,
    auth: { user, pass },
    tls: {
      servername: "smtp.gmail.com",
      rejectUnauthorized: false
    },
    connectionTimeout: 3000,
    greetingTimeout: 3000,
    socketTimeout: 5000
  });
};

// 2️⃣ Secondary: Port 465 (SSL) with IPv4 lookup
const createSSLTransporter = () => {
  const user = (process.env.EMAIL_USER || "pratikkhode1122@gmail.com").trim();
  const pass = getCleanEmailPass();
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    family: 4,
    lookup: ipv4Lookup,
    auth: { user, pass },
    tls: {
      servername: "smtp.gmail.com",
      rejectUnauthorized: false
    },
    connectionTimeout: 3000,
    greetingTimeout: 3000,
    socketTimeout: 5000
  });
};

/* ================= PROFESSIONAL EMAIL OTP ================= */
const sendOtp = async (email, otp) => {
  console.log(`\n======================================================`);
  console.log(`🔑 [OTP DISPATCH] Sending strictly to: ${email}`);
  console.log(`======================================================\n`);

  const user = (process.env.EMAIL_USER || "pratikkhode1122@gmail.com").trim();
  const pass = getCleanEmailPass();

  const mailOptions = {
    from: `"Skill Predictor Security" <${user}>`,
    to: email,
    subject: "Verification Code - Skill Predictor Security",
    html: `
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
    `
  };

  // 🚀 LIGHTNING-FAST DISPATCH STRATEGY:
  // On Cloud Hosting (Render), raw SMTP ports 465/587 are blocked by cloud firewalls.
  // We prioritize the Vercel HTTPS Relay (Port 443) which delivers in < 2 seconds flat!
  const isCloudHost = process.env.RENDER === "true" || process.env.NODE_ENV === "production" || !process.env.LOCAL_DEV;

  if (isCloudHost) {
    try {
      console.log(`⚡ Dispatching OTP via Fast Vercel HTTPS Relay to: ${email}`);
      const axios = require("axios");
      const vercelRes = await axios.post("https://skill-predictor.vercel.app/api/send-otp", {
        email,
        otp,
        subject: mailOptions.subject,
        html: mailOptions.html
      }, { timeout: 5000 });

      if (vercelRes.data && vercelRes.data.success) {
        console.log(`✅ OTP email delivered in < 2s via Vercel HTTPS Relay to: ${email}`);
        return { success: true, delivered: true, transport: "Vercel HTTPS Relay (Fast)" };
      }
    } catch (vercelError) {
      console.warn(`⚠️ Vercel HTTPS relay failed (${vercelError.message}), attempting direct fallback...`);
    }
  }

  // 2️⃣ Localhost / Direct SMTP Transports (for local dev or fallback)
  try {
    const tSSL = createSSLTransporter();
    await tSSL.sendMail(mailOptions);
    console.log(`✅ OTP email delivered via direct SSL 465 to: ${email}`);
    return { success: true, delivered: true, transport: "Port 465 SSL" };
  } catch (sslError) {
    try {
      const t587 = createPort587Transporter();
      await t587.sendMail(mailOptions);
      console.log(`✅ OTP email delivered via Port 587 STARTTLS to: ${email}`);
      return { success: true, delivered: true, transport: "Port 587 STARTTLS" };
    } catch (port587Error) {
      // 3️⃣ Final fallback if not on cloud host
      if (!isCloudHost) {
        try {
          const axios = require("axios");
          const vercelRes = await axios.post("https://skill-predictor.vercel.app/api/send-otp", {
            email,
            otp,
            subject: mailOptions.subject,
            html: mailOptions.html
          }, { timeout: 5000 });

          if (vercelRes.data && vercelRes.data.success) {
            return { success: true, delivered: true, transport: "Vercel HTTPS Relay" };
          }
        } catch (e) {}
      }

      console.error(`❌ Both SMTP and Relay failed to deliver to ${email}: SSL: ${sslError.message} | 587: ${port587Error.message}`);
      return { 
        success: false, 
        delivered: false, 
        error: `SSL: ${sslError.message} | 587: ${port587Error.message}`
      };
    }
  }
};

/* ================= ✅ UPDATED: SMART QUERY RESOLUTION EMAIL ================= */
const sendQueryResolvedEmail = async (email, queryContent, aiAnswer) => {
  try {
    const mailOptions = {
      from: `"Skill Predictor Official Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Inquiry Resolved - Skill Predictor Helpdesk",
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 650px; margin: 40px auto; border-radius: 24px; overflow: hidden; background-color: #ffffff; border: 1px solid #e5e7eb; box-shadow: 0 15px 35px rgba(0,0,0,0.08);">
          <div style="background-color: #0D9488; padding: 45px 30px; text-align: left;">
            <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">Resolution Report</h2>
            <div style="height: 4px; width: 40px; background-color: rgba(255,255,255,0.3); margin: 15px 0;"></div>
            <p style="color: rgba(255,255,255,0.9); font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Skill Predictor Support Network</p>
          </div>
          
          <div style="padding: 45px 40px;">
            <p style="color: #111827; font-size: 16px; font-weight: 700; margin: 0 0 10px 0;">Hello,</p>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.8; margin-bottom: 35px;">
              Our technical support team and AI engine have successfully finalized the analysis of your query. Your inquiry has been marked as <b>Resolved</b>.
            </p>

            <div style="border-radius: 20px; border: 1px solid #f1f5f9; overflow: hidden; background-color: #ffffff; margin-bottom: 35px;">
              <div style="background-color: #f8fafc; padding: 20px 25px; border-bottom: 1px solid #f1f5f9;">
                <p style="color: #6b7280; font-size: 10px; font-weight: 800; text-transform: uppercase; margin: 0 0 8px 0; letter-spacing: 1px;">Submission Reference</p>
                <p style="color: #374151; font-size: 14px; font-style: italic; margin: 0; line-height: 1.6; border-left: 3px solid #0D9488; padding-left: 15px;">"${queryContent}"</p>
              </div>
              
              <div style="padding: 30px 25px;">
                <p style="color: #0D9488; font-size: 10px; font-weight: 900; text-transform: uppercase; margin: 0 0 15px 0; letter-spacing: 1px;">Expert Resolution</p>
                <div style="color: #1f2937; font-size: 15px; line-height: 1.8; text-align: justify; white-space: pre-line;">
                  ${aiAnswer}
                </div>
              </div>
            </div>

            <div style="background-color: #f0fdfa; border-radius: 12px; padding: 20px; border-left: 4px solid #0D9488;">
              <p style="color: #0f766e; font-size: 13px; margin: 0; line-height: 1.6; font-weight: 600;">
                System Update: You can now access all portal features related to this inquiry. Our AI Assistant remains available 24/7 for any further assistance.
              </p>
            </div>
            
            <div style="margin-top: 45px; border-top: 1px solid #f1f5f9; padding-top: 30px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">Kind Regards,</p>
              <p style="color: #0D9488; font-size: 16px; font-weight: 800; margin: 4px 0 0 0;">Skill Predictor Operations</p>
            </div>
          </div>
          
          <div style="background: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #f1f5f9;">
            <p style="color: #9ca3af; font-size: 10px; margin: 0; line-height: 1.8; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">
              Skill Predictor Career Development Hub<br>
              © 2026 OFFICIAL SECURITY NOTIFICATION • ALL RIGHTS RESERVED
            </p>
          </div>
        </div>
      `
    };

    try {
      const t = createSSLTransporter();
      await t.sendMail(mailOptions);
    } catch (e) {
      try {
        const t587 = createPort587Transporter();
        await t587.sendMail(mailOptions);
      } catch (innerErr) {
        console.warn("⚠️ Query resolution email fallback warning:", innerErr.message);
      }
    }
    return true;
  } catch (error) {
    console.error("❌ RESOLVE EMAIL ERROR:", error.message);
    return false;
  }
};

module.exports = { sendOtp, sendQueryResolvedEmail };