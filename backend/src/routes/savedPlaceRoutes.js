const express = require("express");
const savedPlaceController = require("../controllers/savedPlaceController");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

router.get("/", savedPlaceController.getPlaces);
router.post("/", savedPlaceController.createPlace);
router.delete("/:id", savedPlaceController.deletePlace);

module.exports = router;
