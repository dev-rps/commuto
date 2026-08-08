const bookingService = require("../services/bookingService");

class BookingController {
  async bookRide(req, res, next) {
    try {
      const booking = await bookingService.bookRide(
        req.params.id,
        req.user.id,
        req.body
      );
      res.status(201).json({ booking });
    } catch (err) {
      next(err);
    }
  }

  async getMyBookings(req, res, next) {
    try {
      const bookings = await bookingService.getMyBookings(req.user.id);
      res.json({ bookings });
    } catch (err) {
      next(err);
    }
  }

  async cancelBooking(req, res, next) {
    try {
      const booking = await bookingService.cancelBooking(
        req.params.id,
        req.user.id
      );
      res.json({ booking });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new BookingController();
