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
});