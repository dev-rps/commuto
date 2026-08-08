const express = require("express");
const walletController = require("../controllers/walletController");
const requireAuth = require("../middleware/requireAuth");
const validate = require("../middleware/validate");
const { rechargeWalletSchema } = require("../schemas");

const router = express.Router();

router.use(requireAuth);

// POST /api/wallet/recharge — add funds
router.post("/recharge", validate(rechargeWalletSchema), walletController.recharge);

// GET /api/wallet/me — balance + transaction history
router.get("/me", walletController.getMyWallet);

module.exports = router;
