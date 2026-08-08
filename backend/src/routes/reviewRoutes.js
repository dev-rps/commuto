const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const requireAuth = require("../middleware/requireAuth");

router.use(requireAuth);


router.post("/", reviewController.createReview);
router.get("/user", reviewController.getUserReviews);
router.get("/user/:userId", reviewController.getUserReviews);

router.get("/ride/:rideId", reviewController.getRideReviews);

module.exports = router;
