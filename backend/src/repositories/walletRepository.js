const prisma = require("../lib/prismaClient");

class WalletRepository {
  async findUserWithBalance(userId) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, walletBalance: true },
    });
  }

  async createTransaction(data) {
    return prisma.walletTransaction.create({
      data,
    });
  }

  async findTransactionsByUserId(userId) {
    return prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
}

module.exports = new WalletRepository();
