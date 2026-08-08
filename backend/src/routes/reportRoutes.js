const express = require("express");
const reportController = require("../controllers/reportController");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.use(requireAuth);

// GET /api/reports/summary — admin only, org-scoped
router.get(
  "/summary",
  requireRole(["COMPANY_ADMIN"]),
  reportController.getSummary
);

module.exports = router;
