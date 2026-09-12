const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
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
  const user = (process.env.EMAIL_USER || "").trim();
  const rawPass = process.env.EMAIL_PASS || "";
  const pass = rawPass.replace(/\s+/g, "");

  const info = {
    hasUser: !!process.env.EMAIL_USER,
    userValue: user ? user.replace(/(.{3})(.*)(@.*)/, "$1***$3") : "not set",
    hasPass: !!process.env.EMAIL_PASS,
    passLength: pass ? pass.length : 0
  };

  const nodemailer = require("nodemailer");
  const ipv4Lookup = (hostname, options, callback) => {
    dns.lookup(hostname, { family: 4 }, callback);
  };

  let ips = [];
  try {
    ips = await dns.promises.resolve4("smtp.gmail.com");
  } catch (err) {
    ips = [err.message];
  }

  // Test 1: Direct IPv4 on Port 465 (SSL)
  const targetIp = ips[0] && !ips[0].includes(" ") ? ips[0] : "142.250.192.108";
  const tDirect465 = nodemailer.createTransport({
    host: targetIp,
    port: 465,
    secure: true,
    auth: { user, pass },
    tls: { servername: "smtp.gmail.com", rejectUnauthorized: false },
    connectionTimeout: 5000
  });

  // Test 2: Standard service: "gmail"
  const tService = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
    connectionTimeout: 5000
  });

  let rDirect465 = null, rService = null;
  try {
    await tDirect465.verify();
    rDirect465 = "VERIFIED_OK";
  } catch (e) {
    rDirect465 = { error: e.message, code: e.code };
  }

  try {
    await tService.verify();
    rService = "VERIFIED_OK";
  } catch (e) {
    rService = { error: e.message, code: e.code };
  }

  return res.json({
    success: rDirect465 === "VERIFIED_OK" || rService === "VERIFIED_OK",
    resolvedIpv4s: ips,
    directIpv4_465: rDirect465,
    service_gmail: rService,
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