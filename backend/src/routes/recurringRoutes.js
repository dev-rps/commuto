const express = require("express");
const router = express.Router();
const recurringController = require("../controllers/recurringController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware.authenticate);

router.post("/", recurringController.create);
router.get("/my", recurringController.getMySchedules);
router.delete("/:id", recurringController.deleteSchedule);

module.exports = router;
