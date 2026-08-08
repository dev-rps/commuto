const vehicleService = require("../services/vehicleService");

class VehicleController {
  async createVehicle(req, res, next) {
    try {
      const vehicle = await vehicleService.registerVehicle(req.user.id, req.body);
      res.status(201).json({ vehicle });
    } catch (err) {
      next(err);
    }
  }

  async getMyVehicles(req, res, next) {
    try {
      const vehicles = await vehicleService.getMyVehicles(req.user.id);
      res.json({ vehicles });
    } catch (err) {
      next(err);
    }
  }

  async updateVehicle(req, res, next) {
    try {
      const vehicle = await vehicleService.updateVehicle(req.params.id, req.user.id, req.body);
      res.json({ vehicle });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new VehicleController();
