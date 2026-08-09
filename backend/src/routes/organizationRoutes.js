const express = require("express");
const prisma = require("../lib/prismaClient");

const router = express.Router();

const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");
const validate = require("../middleware/validate");
const { policySchema } = require("../schemas");

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
router.patch(
  "/my/policy",
  requireAuth,
  requireRole(["COMPANY_ADMIN"]),
  validate(policySchema),
  async (req, res, next) => {
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

// GET /api/organizations/my/members — all employees in the admin's organisation
router.get("/my/members", requireAuth, requireRole(["COMPANY_ADMIN"]), async (req, res, next) => {
  try {
    const members = await prisma.user.findMany({
      where: { organizationId: req.user.organizationId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        walletBalance: true,
        createdAt: true,
        _count: {
          select: {
            ridesOffered: true,
            ridesBooked: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    res.json({ members });
  } catch (err) {
    next(err);
  }
});

// GET /api/organizations/my/rides — all rides offered by drivers in the admin's organisation
router.get("/my/rides", requireAuth, requireRole(["COMPANY_ADMIN"]), async (req, res, next) => {
  try {
    const rides = await prisma.ride.findMany({
      where: {
        driver: { organizationId: req.user.organizationId },
      },
      include: {
        driver: { select: { id: true, name: true, email: true } },
        vehicle: { select: { id: true, model: true, registrationNo: true } },
        bookings: {
          include: {
            passenger: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ rides });
  } catch (err) {
    next(err);
  }
});

// GET /api/organizations/my/bookings — all bookings made by passengers in the admin's organisation
router.get("/my/bookings", requireAuth, requireRole(["COMPANY_ADMIN"]), async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        passenger: { organizationId: req.user.organizationId },
      },
      include: {
        passenger: { select: { id: true, name: true, email: true } },
        ride: {
          select: {
            id: true,
            pickupLoc: true,
            destination: true,
            departureTime: true,
            status: true,
            driver: { select: { id: true, name: true } },
          },
        },
        payment: { select: { id: true, method: true, status: true, amount: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

