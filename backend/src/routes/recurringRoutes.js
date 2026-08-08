const express = require("express");
const router = express.Router();
const recurringController = require("../controllers/recurringController");
const requireAuth = require("../middleware/requireAuth");

router.use(requireAuth);


router.post("/", recurringController.create);
router.get("/my", recurringController.getMySchedules);
router.delete("/:id", recurringController.deleteSchedule);

module.exports = router;
