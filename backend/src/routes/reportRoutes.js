const express = require("express");
const reportController = require("../controllers/reportController");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.use(requireAuth);

// GET /api/reports/summary — admin only, org-scoped
router.get(
  "/summary",
  requireRole(["COMPANY_ADMIN", "SUPER_ADMIN"]),
  reportController.getSummary
);

// GET /api/reports/leaderboard — org-scoped employee leaderboard
router.get("/leaderboard", reportController.getLeaderboard);

// GET /api/reports/platform-overview — super admin global metrics & database overview
router.get(
  "/platform-overview",
  requireRole(["SUPER_ADMIN"]),
  reportController.getPlatformOverview
);

module.exports = router;

