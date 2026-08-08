const express = require("express");
const bookingController = require("../controllers/bookingController");
const paymentController = require("../controllers/paymentController");
const requireAuth = require("../middleware/requireAuth");
const validate = require("../middleware/validate");
const { initiatePaymentSchema } = require("../schemas");

const router = express.Router();

router.use(requireAuth);

// GET /api/bookings/me — passenger's own bookings
router.get("/me", bookingController.getMyBookings);

// PATCH /api/bookings/:id/cancel — passenger self-cancel
router.patch("/:id/cancel", bookingController.cancelBooking);

// POST /api/bookings/:id/payment — initiate payment
router.post(
  "/:id/payment",
  validate(initiatePaymentSchema),
  paymentController.initiatePayment
);

// POST /api/bookings/:id/payment/verify — Razorpay signature verification
router.post("/:id/payment/verify", paymentController.verifyPayment);

module.exports = router;
