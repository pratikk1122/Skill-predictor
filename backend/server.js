require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./src/config/db");
const app = require("./src/app");


const { setupGDSockets } = require("./src/controllers/gd.controller");

// Database Connection
connectDB();

// Routes
app.use("/api/gd", require("./src/routes/gd.routes"));
app.use("/api/analytics", require("./src/routes/analyticsRoutes"));

try {
  app.use("/api/company-prep", require("./src/routes/companyPrep.routes"));
} catch (err) {
  console.log("Company Prep Route mount failed in server.js");
}

app.get("/", (req, res) => {
  res.send("Server is Running and Socket is Active!");
});

// 🔥 ZERO-COLD-START HEALTH CHECK ENDPOINT
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "online",
    service: "skill-predictor-backend",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// 🔍 SMTP DIAGNOSTIC ENDPOINT
app.get("/api/debug-smtp", async (req, res) => {
  const user = process.env.EMAIL_USER;
  const rawPass = process.env.EMAIL_PASS;
  const pass = rawPass ? rawPass.replace(/\s+/g, "") : "";

  const info = {
    hasUser: !!user,
    userValue: user ? user.trim() : null,
    hasPass: !!rawPass,
    passLength: pass ? pass.length : 0
  };

  if (!user || !pass) {
    return res.json({ success: false, reason: "ENV_VARS_MISSING", ...info });
  }

  const nodemailer = require("nodemailer");
  const t465 = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: user.trim(), pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000
  });

  const t587 = nodemailer.createTransport({
    service: "gmail",
    auth: { user: user.trim(), pass },
    connectionTimeout: 10000
  });

  let r465 = null, r587 = null;
  try {
    await t465.verify();
    r465 = "VERIFIED_OK";
  } catch (e) {
    r465 = { error: e.message, code: e.code };
  }

  try {
    await t587.verify();
    r587 = "VERIFIED_OK";
  } catch (e) {
    r587 = { error: e.message, code: e.code };
  }

  return res.json({
    success: r465 === "VERIFIED_OK" || r587 === "VERIFIED_OK",
    port465_SSL: r465,
    port587_GmailService: r587,
    info
  });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 🔥 MAGIC HAPPENS HERE: Server.js ekdum clean. Saara logic Controller mein.
setupGDSockets(io);

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // 🔥 ZERO COLD-START KEEP-ALIVE (Pings server every 14 min so Render free tier never sleeps)
  const isProd = process.env.NODE_ENV === "production" || process.env.RENDER;
  if (isProd) {
    const keepAliveUrl = "https://skill-predictor-backend.onrender.com/api/health";
    const https = require("https");
    setInterval(() => {
      https.get(keepAliveUrl, (res) => {
        console.log(`[KeepAlive Ping] PING OK -> Status ${res.statusCode} at ${new Date().toLocaleTimeString()}`);
      }).on("error", (err) => {
        console.warn(`[KeepAlive Ping Warning]: ${err.message}`);
      });
    }, 14 * 60 * 1000); // Every 14 mins
    console.log("⚡ Zero-Cold-Start KeepAlive active: Pinging backend every 14 mins.");
  }
});