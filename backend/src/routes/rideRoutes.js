const express = require("express");
const rideController = require("../controllers/rideController");
const requireAuth = require("../middleware/requireAuth");
const validate = require("../middleware/validate");
const {
  createRideSchema,
  searchRideSchema,
  updateRideStatusSchema,
} = require("../schemas");

const router = express.Router();

router.use(requireAuth);

router.post("/", validate(createRideSchema), rideController.publishRide);
router.get("/search", validate(searchRideSchema, "query"), rideController.searchRides);
router.patch("/:id/status", validate(updateRideStatusSchema), rideController.updateStatus);

module.exports = router;
