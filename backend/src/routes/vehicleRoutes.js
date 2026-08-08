const express = require("express");
const vehicleController = require("../controllers/vehicleController");
const requireAuth = require("../middleware/requireAuth");
const validate = require("../middleware/validate");
const { createVehicleSchema, updateVehicleSchema } = require("../schemas");

const router = express.Router();

router.use(requireAuth);

router.post("/", validate(createVehicleSchema), vehicleController.createVehicle);
router.get("/me", vehicleController.getMyVehicles);
router.patch("/:id", validate(updateVehicleSchema), vehicleController.updateVehicle);

module.exports = router;
