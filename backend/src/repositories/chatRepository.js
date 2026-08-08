const prisma = require("../lib/prismaClient");

class ChatRepository {
  async createMessage(data) {
    return prisma.chatMessage.create({
      data,
      include: {
        sender: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findByRideId(rideId) {
    return prisma.chatMessage.findMany({
      where: { rideId },
      orderBy: { sentAt: "asc" },
      include: {
        sender: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }
}

module.exports = new ChatRepository();
