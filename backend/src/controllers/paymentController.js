const paymentService = require("../services/paymentService");

class PaymentController {
  async initiatePayment(req, res, next) {
    try {
      const result = await paymentService.initiatePayment(
        req.params.id,
        req.user.id,
        req.body
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async verifyPayment(req, res, next) {
    try {
      const result = await paymentService.verifyPayment(
        req.params.id,
        req.user.id,
        req.body
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PaymentController();
