const express = require("express");
const router = express.Router();
const safetyController = require("../controllers/safetyController");
const requireAuth = require("../middleware/requireAuth");

router.use(requireAuth);


router.get("/contacts", safetyController.getContacts);
router.post("/contacts", safetyController.addContact);
router.delete("/contacts/:contactId", safetyController.deleteContact);
router.post("/sos", safetyController.triggerSos);

module.exports = router;
