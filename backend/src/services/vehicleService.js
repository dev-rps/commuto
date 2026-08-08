const vehicleRepository = require("../repositories/vehicleRepository");

class VehicleService {
  async registerVehicle(driverId, { model, registrationNo, seatingCap, fuelEfficiencyKmpl }) {
    const existing = await vehicleRepository.findByRegistrationNo(registrationNo);
    if (existing) {
      const error = new Error("Vehicle with this registration number already exists");
      error.status = 409;
      throw error;
    }

    return vehicleRepository.createVehicle({
      driverId,
      model,
      registrationNo,
      seatingCap,
      fuelEfficiencyKmpl: fuelEfficiencyKmpl ?? null,
    });
  }

  async getMyVehicles(driverId) {
    return vehicleRepository.findByDriverId(driverId);
  }

  async updateVehicle(vehicleId, driverId, updateData) {
    const vehicle = await vehicleRepository.findById(vehicleId);
    if (!vehicle) {
      const error = new Error("Vehicle not found");
      error.status = 404;
      throw error;
    }

    // Row-level ownership check
    if (vehicle.driverId !== driverId) {
      const error = new Error("Forbidden: You do not own this vehicle");
      error.status = 403;
      throw error;
    }

    if (updateData.registrationNo && updateData.registrationNo !== vehicle.registrationNo) {
      const existing = await vehicleRepository.findByRegistrationNo(updateData.registrationNo);
      if (existing) {
        const error = new Error("Vehicle with this registration number already exists");
        error.status = 409;
        throw error;
      }
    }

    return vehicleRepository.updateVehicle(vehicleId, updateData);
  }
}

module.exports = new VehicleService();
