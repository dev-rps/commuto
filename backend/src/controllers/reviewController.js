const reviewService = require("../services/reviewService");

class ReviewController {
  async createReview(req, res, next) {
    try {
      const review = await reviewService.createReview(req.user.id, req.body);
      res.status(201).json({ message: "Review submitted successfully", review });
    } catch (err) {
      next(err);
    }
  }

  async getUserReviews(req, res, next) {
    try {
      const userId = req.params.userId || req.user.id;
      const data = await reviewService.getUserReviews(userId);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getRideReviews(req, res, next) {
    try {
      const reviews = await reviewService.getRideReviews(req.params.rideId);
      res.json({ reviews });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReviewController();
