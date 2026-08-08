const prisma = require("../lib/prisma");

class RecurringService {
  async createRecurringRide(driverId, data) {
    const {
      vehicleId,
      pickupLoc,
      pickupLat,
      pickupLng,
      destination,
      destLat,
      destLng,
      departureTime,
      daysOfWeek,
      availableSeats,
      farePerSeat,
    } = data;

    if (!vehicleId || !pickupLoc || !destination || !departureTime) {
      const error = new Error("Vehicle, pickup, destination, and departure time are required");
      error.status = 400;
      throw error;
    }

    return prisma.recurringRide.create({
      data: {
        driverId,
        vehicleId,
        pickupLoc,
        pickupLat: parseFloat(pickupLat) || 0,
        pickupLng: parseFloat(pickupLng) || 0,
        destination,
        destLat: parseFloat(destLat) || 0,
        destLng: parseFloat(destLng) || 0,
        departureTime,
        daysOfWeek: daysOfWeek || "MON,TUE,WED,THU,FRI",
        availableSeats: parseInt(availableSeats, 10) || 3,
        farePerSeat: parseFloat(farePerSeat) || 0,
        isActive: true,
      },
      include: {
        vehicle: true,
      },
    });
  }

  async getMyRecurringRides(driverId) {
    return prisma.recurringRide.findMany({
      where: { driverId, isActive: true },
      include: { vehicle: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async deleteRecurringRide(driverId, id) {
    return prisma.recurringRide.updateMany({
      where: { id, driverId },
      data: { isActive: false },
    });
  }
}

module.exports = new RecurringService();
