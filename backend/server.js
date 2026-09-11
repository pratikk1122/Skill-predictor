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