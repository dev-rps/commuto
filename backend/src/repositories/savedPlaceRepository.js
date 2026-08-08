const prisma = require("../lib/prismaClient");

class SavedPlaceRepository {
  async findByUserId(userId) {
    return prisma.savedPlace.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });
  }

  async findById(id) {
    return prisma.savedPlace.findUnique({ where: { id } });
  }

  async create({ userId, name, latitude, longitude }) {
    return prisma.savedPlace.create({
      data: { userId, name, latitude, longitude },
    });
  }

  async delete(id) {
    return prisma.savedPlace.delete({ where: { id } });
  }
}

module.exports = new SavedPlaceRepository();
