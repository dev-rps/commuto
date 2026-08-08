const jwt = require("jsonwebtoken");

// ── Socket event name constants ─────────────────────────────────────
// Matches the architecture diagram — don't improvise new ones.
const SOCKET_EVENTS = {
  rideLocation: (rideId) => `ride:location:${rideId}`,
  rideStatus: (rideId) => `ride:status:${rideId}`,
  chatMessage: (rideId) => `chat:message:${rideId}`,
  notificationNew: (userId) => `notification:new:${userId}`,
  ridePublished: (orgId) => `ride:published:${orgId}`,
};

/** @type {import("socket.io").Server | null} */
let _io = null;

/**
 * Get the Socket.IO server instance.
 * Call this from services to emit events without importing io directly.
 * @returns {import("socket.io").Server}
 */
function getIO() {
  if (!_io) {
    throw new Error("Socket.IO has not been initialized. Call setupSockets() first.");
  }
  return _io;
}

/**
 * Initialize Socket.IO with JWT-authenticated handshake.
 *
 * Room-join pattern on connect:
 *   - Every socket joins `user:{userId}`
 *   - Every socket joins `org:{organizationId}` for company-scoped ride announcements
 *   - COMPANY_ADMIN additionally joins `admin:{organizationId}`
 *
 * @param {import("socket.io").Server} io
 */
function setupSockets(io) {
  _io = io;

  const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
  if (!ACCESS_SECRET) {
    throw new Error("FATAL: JWT_ACCESS_SECRET is not set — cannot authenticate sockets");
  }

  // ── JWT-authenticated handshake ─────────────────────────────────
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = jwt.verify(token, ACCESS_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error("Invalid or expired token"));
    }
  });

  // ── Connection handler ──────────────────────────────────────────
  io.on("connection", (socket) => {
    const { id: userId, role, organizationId } = socket.user;

    // Every authenticated user joins their personal room
    socket.join(`user:${userId}`);

    // Every user joins their company org room for announcements
    if (organizationId) {
      socket.join(`org:${organizationId}`);
    }

    // COMPANY_ADMIN joins org-scoped admin room
    if (role === "COMPANY_ADMIN" && organizationId) {
      socket.join(`admin:${organizationId}`);
    }

    console.log(
      `[Socket] ${socket.user.name || userId} connected (role=${role}, rooms=${[...socket.rooms].join(", ")})`
    );

    socket.on("disconnect", (reason) => {
      console.log(`[Socket] ${userId} disconnected (${reason})`);
    });

    // Ride room joins for chat and tracking
    socket.on("join:ride", (rideId) => {
      socket.join(`ride:${rideId}`);
      console.log(`[Socket] ${userId} joined ride:${rideId}`);
    });

    socket.on("leave:ride", (rideId) => {
      socket.leave(`ride:${rideId}`);
      console.log(`[Socket] ${userId} left ride:${rideId}`);
    });
  });

  console.log("⚡ Socket.IO initialized with JWT auth");
}

module.exports = {
  SOCKET_EVENTS,
  getIO,
  setupSockets,
};
