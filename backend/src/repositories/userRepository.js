const prisma = require("../lib/prismaClient");

class UserRepository {
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });
  }

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        organizationId: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        walletBalance: true,
        createdAt: true,
        organization: {
          select: {
            id: true,
            name: true,
            fuelCostPerL: true,
            costPerKm: true,
          },
        },
      },
    });
  }

  async createUser(data) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        organizationId: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        walletBalance: true,
        createdAt: true,
        organization: {
          select: {
            id: true,
            name: true,
            fuelCostPerL: true,
            costPerKm: true,
          },
        },
      },
    });
  }

  async updateUser(id, data) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        organizationId: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        walletBalance: true,
        createdAt: true,
      },
    });
  }

  async findOrganizationById(id) {
    return prisma.organization.findUnique({
      where: { id },
    });
  }
}

module.exports = new UserRepository();
