const walletService = require("../services/walletService");

class WalletController {
  async recharge(req, res, next) {
    try {
      const result = await walletService.recharge(req.user.id, req.body.amount);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getMyWallet(req, res, next) {
    try {
      const wallet = await walletService.getMyWallet(req.user.id);
      res.json(wallet);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new WalletController();
