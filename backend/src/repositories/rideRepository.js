const prisma = require("../lib/prismaClient");

class RideRepository {
  async createRide(data) {
    return prisma.ride.create({
      data,
      include: {
        vehicle: true,
        driver: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findById(id) {
    return prisma.ride.findUnique({
      where: { id },
      include: {
        vehicle: true,
        driver: {
          select: { id: true, name: true, email: true, organizationId: true },
        },
        bookings: {
          include: {
            passenger: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
  }

  async updateRide(id, data) {
    return prisma.ride.update({
      where: { id },
      data,
      include: {
        vehicle: true,
        driver: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findActiveRidesForSearch({ minSeats, minTime, maxTime, organizationId }) {
    const where = {
      status: "PUBLISHED",
      availableSeats: { gte: minSeats },
    };

    if (minTime || maxTime) {
      where.departureTime = {};
      if (minTime) where.departureTime.gte = minTime;
      if (maxTime) where.departureTime.lte = maxTime;
    }

    if (organizationId) {
      where.driver = {
        organizationId: organizationId,
      };
    }

    return prisma.ride.findMany({
      where,
      include: {
        vehicle: true,
        driver: {
          select: { id: true, name: true, email: true, organizationId: true },
        },
      },
    });
  }

  async findDriverActiveVehicles(driverId) {
    return prisma.vehicle.findMany({
      where: {
        driverId,
        isActive: true,
      },
    });
  }

  async createLocation({ rideId, latitude, longitude }) {
    return prisma.rideLocation.create({
      data: {
        rideId,
        latitude,
        longitude,
      },
    });
  }

  async getLocations(rideId) {
    return prisma.rideLocation.findMany({
      where: { rideId },
      orderBy: { timestamp: "asc" },
    });
  }
  async findByDriverId(driverId) {
    return prisma.ride.findMany({
      where: { driverId },
      include: {
        vehicle: true,
        bookings: {
          include: {
            passenger: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

module.exports = new RideRepository();
