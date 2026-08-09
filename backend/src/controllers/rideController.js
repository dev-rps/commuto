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

  async getRide(req, res, next) {
    try {
      const ride = await rideService.getRide(req.params.id);
      res.json({ ride });
    } catch (err) {
      next(err);
    }
  }

  async getMyRides(req, res, next) {
    try {
      const rides = await rideService.getMyRides(req.user.id);
      res.json({ rides });
    } catch (err) {
      next(err);
    }
  }

  async searchRides(req, res, next) {
    try {
      const rides = await rideService.searchRides({
        ...req.query,
        organizationId: req.user.organizationId,
      });
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

  async startRide(req, res, next) {
    try {
      const { otp } = req.body;
      if (!otp) {
        return res.status(400).json({ error: "OTP is required to start the ride" });
      }
      const ride = await rideService.startRide(req.params.id, req.user.id, otp);
      res.json({ ride });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new RideController();
