const prisma = require("../lib/prismaClient");

class BookingRepository {
  async createBooking(data) {
    return prisma.booking.create({
      data,
      include: {
        ride: {
          include: {
            vehicle: true,
            driver: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        passenger: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findById(id) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        ride: {
          include: {
            vehicle: true,
            driver: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        passenger: {
          select: { id: true, name: true, email: true },
        },
        payment: true,
      },
    });
  }

  async findByPassengerId(passengerId) {
    return prisma.booking.findMany({
      where: { passengerId },
      orderBy: { createdAt: "desc" },
      include: {
        ride: {
          include: {
            vehicle: true,
            driver: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        payment: true,
        reviews: true,
      },
    });
  }

  async updateBooking(id, data) {
    return prisma.booking.update({
      where: { id },
      data,
      include: {
        ride: {
          include: {
            vehicle: true,
            driver: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        passenger: {
          select: { id: true, name: true, email: true },
        },
        payment: true,
      },
    });
  }
}

module.exports = new BookingRepository();
