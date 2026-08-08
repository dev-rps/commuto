const prisma = require("../lib/prismaClient");
const walletRepository = require("../repositories/walletRepository");

class WalletService {
  /**
   * Recharge wallet — add funds with a WalletTransaction record.
   * Uses Prisma transaction to ensure balance + history row are always in sync.
   */
  async recharge(userId, amount) {
    return prisma.$transaction(async (tx) => {
      // Fetch current balance inside transaction
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { walletBalance: true },
      });

      if (!user) {
        const error = new Error("User not found");
        error.status = 404;
        throw error;
      }

      const currentBalance = Number(user.walletBalance);
      const newBalance = currentBalance + amount;

      // Update balance
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: newBalance },
      });

      // Insert WalletTransaction — historical record, never update balance without one
      const transaction = await tx.walletTransaction.create({
        data: {
          userId,
          type: "RECHARGE",
          amount,
          balanceAfter: newBalance,
        },
      });

      return {
        transaction,
        walletBalance: newBalance,
        message: `Wallet recharged with ₹${amount}. New balance: ₹${newBalance}`,
      };
    });
  }

  /**
   * Get wallet balance and full transaction history for the authenticated user.
   */
  async getMyWallet(userId) {
    const user = await walletRepository.findUserWithBalance(userId);

    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    const transactions = await walletRepository.findTransactionsByUserId(userId);

    return {
      balance: user.walletBalance,
      transactions,
    };
  }
}

module.exports = new WalletService();
