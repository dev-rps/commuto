require("dotenv/config");
const http = require("http");
const { Server: SocketIOServer } = require("socket.io");
const createApp = require("./app");

const app = createApp();
const server = http.createServer(app);

// ── Socket.IO ─────────────────────────────────────────────────────────
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  },
});

// Socket setup is wired in src/sockets/index.js once that module exists.
// For now, export the io instance so it can be configured externally.
app.set("io", io);

// ── Start ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Commuto API listening on port ${PORT}`);
});

// Render needs this export to manage graceful shutdown
module.exports = server;
