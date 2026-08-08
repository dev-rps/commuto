const prisma = require("../lib/prismaClient");

class VehicleRepository {
  async createVehicle(data) {
    return prisma.vehicle.create({
      data,
    });
  }

  async findByDriverId(driverId) {
    return prisma.vehicle.findMany({
      where: { driverId },
      orderBy: { model: "asc" },
    });
  }

  async findById(id) {
    return prisma.vehicle.findUnique({
      where: { id },
    });
  }

  async findByRegistrationNo(registrationNo) {
    return prisma.vehicle.findUnique({
      where: { registrationNo },
    });
  }

  async updateVehicle(id, data) {
    return prisma.vehicle.update({
      where: { id },
      data,
    });
  }
}

module.exports = new VehicleRepository();
