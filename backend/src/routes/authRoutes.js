const express = require("express");
const authController = require("../controllers/authController");
const requireAuth = require("../middleware/requireAuth");
const validate = require("../middleware/validate");
const { signupSchema, loginSchema, updateMeSchema, completeProfileSchema } = require("../schemas");

const router = express.Router();

router.post("/signup", validate(signupSchema), authController.signup);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.get("/me", requireAuth, authController.getMe);
router.patch("/me", requireAuth, validate(updateMeSchema), authController.updateMe);
router.post("/complete-profile", requireAuth, validate(completeProfileSchema), authController.completeProfile);

module.exports = router;
