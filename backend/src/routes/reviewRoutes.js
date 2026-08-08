const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware.authenticate);

router.post("/", reviewController.createReview);
router.get("/user/:userId?", reviewController.getUserReviews);
router.get("/ride/:rideId", reviewController.getRideReviews);

module.exports = router;
