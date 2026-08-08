const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const rideRoutes = require("./routes/rideRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const walletRoutes = require("./routes/walletRoutes");
const reportRoutes = require("./routes/reportRoutes");
const savedPlaceRoutes = require("./routes/savedPlaceRoutes");
const organizationRoutes = require("./routes/organizationRoutes");

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
  app.use("/api/vehicles", vehicleRoutes);
  app.use("/api/rides", rideRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/wallet", walletRoutes);
  app.use("/api/reports", reportRoutes);
  app.use("/api/saved-places", savedPlaceRoutes);
  app.use("/api/organizations", organizationRoutes);

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
