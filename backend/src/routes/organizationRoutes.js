const express = require("express");
const prisma = require("../lib/prismaClient");

const router = express.Router();

// Public route — used during signup so users can pick their org
router.get("/", async (_req, res, next) => {
  try {
    const organizations = await prisma.organization.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    res.json({ organizations });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
