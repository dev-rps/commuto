const express = require("express");
const rideController = require("../controllers/rideController");
const bookingController = require("../controllers/bookingController");
const chatController = require("../controllers/chatController");
const requireAuth = require("../middleware/requireAuth");
const validate = require("../middleware/validate");
const {
  createRideSchema,
  searchRideSchema,
  updateRideStatusSchema,
  updateLocationSchema,
  createBookingSchema,
  sendMessageSchema,
} = require("../schemas");

const router = express.Router();

router.use(requireAuth);

router.post("/", validate(createRideSchema), rideController.publishRide);
router.get("/my", rideController.getMyRides);
router.get("/search", validate(searchRideSchema, "query"), rideController.searchRides);
router.get("/:id", rideController.getRide);
router.patch("/:id/status", validate(updateRideStatusSchema), rideController.updateStatus);
router.post("/:id/location", validate(updateLocationSchema), rideController.postLocation);
router.post("/:id/start", rideController.startRide);

// ── Booking (nested under rides) ────────────────────────────────────
router.post("/:id/book", validate(createBookingSchema), bookingController.bookRide);

// ── Chat (nested under rides) ───────────────────────────────────────
router.post("/:id/messages", validate(sendMessageSchema), chatController.sendMessage);
router.get("/:id/messages", chatController.getMessages);

module.exports = router;
