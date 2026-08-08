const prisma = require("../lib/prismaClient");

class PaymentRepository {
  async createPayment(data) {
    return prisma.payment.create({
      data,
      include: {
        booking: {
          include: {
            ride: true,
            passenger: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
  }

  async findByBookingId(bookingId) {
    return prisma.payment.findUnique({
      where: { bookingId },
    });
  }

  async findById(id) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        booking: true,
      },
    });
  }

  async updatePayment(id, data) {
    return prisma.payment.update({
      where: { id },
      data,
      include: {
        booking: {
          include: {
            ride: true,
            passenger: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
  }
}

module.exports = new PaymentRepository();
