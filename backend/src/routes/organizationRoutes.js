const express = require("express");
const prisma = require("../lib/prismaClient");

const router = express.Router();

const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

// Public route — used during signup so users can pick their org
router.get("/", async (_req, res, next) => {
  try {
    const organizations = await prisma.organization.findMany({
      select: { id: true, name: true, fuelCostPerL: true, costPerKm: true },
      orderBy: { name: "asc" },
    });
    res.json({ organizations });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/organizations/my/policy — company admin updates policy benchmark
router.patch("/my/policy", requireAuth, requireRole(["COMPANY_ADMIN"]), async (req, res, next) => {
  try {
    const { fuelCostPerL, costPerKm } = req.body;
    const org = await prisma.organization.update({
      where: { id: req.user.organizationId },
      data: {
        ...(fuelCostPerL !== undefined && { fuelCostPerL: parseFloat(fuelCostPerL) }),
        ...(costPerKm !== undefined && { costPerKm: parseFloat(costPerKm) }),
      },
    });
    res.json({ message: "Organization policy updated successfully", organization: org });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
