const rideService = require("../services/rideService");

class RideController {
  async publishRide(req, res, next) {
    try {
      const ride = await rideService.publishRide(req.user.id, req.body);
      res.status(201).json({ ride });
    } catch (err) {
      next(err);
    }
  }

  async searchRides(req, res, next) {
    try {
      const rides = await rideService.searchRides(req.query);
      res.json({ rides });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const ride = await rideService.updateRideStatus(
        req.params.id,
        req.user.id,
        req.body.status
      );
      res.json({ ride });
    } catch (err) {
      next(err);
    }
  }

  async postLocation(req, res, next) {
    try {
      const location = await rideService.postLocation(
        req.params.id,
        req.user.id,
        req.body
      );
      res.status(201).json({ location });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new RideController();
