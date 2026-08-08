const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");

/**
 * Express app factory.
 * Middleware order: CORS → JSON body parser → Cookie parser → request logger.
 */
function createApp() {
  const app = express();

  // ── CORS ──────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      credentials: true,
    })
  );

  // ── Body parser & Cookies ─────────────────────────────────────────
  app.use(express.json());
  app.use(cookieParser());

  // ── Request logger ────────────────────────────────────────────────
  app.use((req, _res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
    next();
  });

  // ── Health check ──────────────────────────────────────────────────
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "commuto-api" });
  });

  // ── Routes ────────────────────────────────────────────────────────
  app.use("/api/auth", authRoutes);
  // Routes are mounted here as modules are built:
  // app.use("/api/auth",     require("./routes/auth"));
  // app.use("/api/rides",    require("./routes/rides"));
  // app.use("/api/bookings", require("./routes/bookings"));
  // app.use("/api/payments", require("./routes/payments"));
  // app.use("/api/wallet",   require("./routes/wallet"));
  // app.use("/api/vehicles", require("./routes/vehicles"));

  // ── 404 catch-all ─────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // ── Global error handler ──────────────────────────────────────────
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error("Unhandled error:", err);
    res.status(err.status || 500).json({
      error: err.message || "Internal server error",
    });
  });

  return app;
}

module.exports = createApp;
