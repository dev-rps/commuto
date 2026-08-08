const prisma = require("../lib/prismaClient");


class SafetyService {
  async getTrustedContacts(userId) {
    return prisma.trustedContact.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async addTrustedContact(userId, { name, phone, email }) {
    if (!name || !phone) {
      const error = new Error("Name and phone are required");
      error.status = 400;
      throw error;
    }
    return prisma.trustedContact.create({
      data: { userId, name, phone, email },
    });
  }

  async deleteTrustedContact(userId, contactId) {
    return prisma.trustedContact.deleteMany({
      where: { id: contactId, userId },
    });
  }

  async triggerSos(userId, { rideId, latitude, longitude }) {
    if (!rideId) {
      const error = new Error("rideId is required");
      error.status = 400;
      throw error;
    }

    const sosAlert = await prisma.sosAlert.create({
      data: {
        rideId,
        userId,
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
        status: "ACTIVE",
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        ride: { select: { id: true, pickupLoc: true, destination: true } },
      },
    });

    const contacts = await prisma.trustedContact.findMany({
      where: { userId },
    });

    return {
      sosAlert,
      contactsNotifiedCount: contacts.length,
      contacts,
      message: `EMERGENCY SOS ALERT ACTIVATED! Live coordinates (${latitude}, ${longitude}) dispatched to ${contacts.length} trusted contact(s).`,
    };
  }

  async getActiveSosForRide(rideId) {
    return prisma.sosAlert.findMany({
      where: { rideId, status: "ACTIVE" },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  }
}

module.exports = new SafetyService();
