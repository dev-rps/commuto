const express = require("express");
const router = express.Router();
const safetyController = require("../controllers/safetyController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware.authenticate);

router.get("/contacts", safetyController.getContacts);
router.post("/contacts", safetyController.addContact);
router.delete("/contacts/:contactId", safetyController.deleteContact);
router.post("/sos", safetyController.triggerSos);

module.exports = router;
