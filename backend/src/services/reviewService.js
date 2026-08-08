const prisma = require("../lib/prisma");

class ReviewService {
  async createReview(reviewerId, { rideId, bookingId, revieweeId, rating, comment }) {
    if (!rideId || !revieweeId || !rating) {
      const error = new Error("rideId, revieweeId, and rating are required");
      error.status = 400;
      throw error;
    }

    if (rating < 1 || rating > 5) {
      const error = new Error("Rating must be between 1 and 5");
      error.status = 400;
      throw error;
    }

    return prisma.review.create({
      data: {
        rideId,
        bookingId: bookingId || null,
        reviewerId,
        revieweeId,
        rating: parseInt(rating, 10),
        comment: comment || null,
      },
      include: {
        reviewer: { select: { id: true, name: true } },
        reviewee: { select: { id: true, name: true } },
      },
    });
  }

  async getUserReviews(userId) {
    const reviews = await prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: { select: { id: true, name: true } },
        ride: { select: { pickupLoc: true, destination: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const total = reviews.length;
    const avgRating = total > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / total) * 10) / 10
      : 5.0;

    return {
      reviews,
      total,
      avgRating,
    };
  }

  async getRideReviews(rideId) {
    return prisma.review.findMany({
      where: { rideId },
      include: {
        reviewer: { select: { id: true, name: true } },
        reviewee: { select: { id: true, name: true } },
      },
    });
  }
}

module.exports = new ReviewService();
