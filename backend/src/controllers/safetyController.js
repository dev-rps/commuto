const safetyService = require("../services/safetyService");

class SafetyController {
  async getContacts(req, res, next) {
    try {
      const contacts = await safetyService.getTrustedContacts(req.user.id);
      res.json({ contacts });
    } catch (err) {
      next(err);
    }
  }

  async addContact(req, res, next) {
    try {
      const contact = await safetyService.addTrustedContact(req.user.id, req.body);
      res.status(201).json({ message: "Trusted contact added", contact });
    } catch (err) {
      next(err);
    }
  }

  async deleteContact(req, res, next) {
    try {
      await safetyService.deleteTrustedContact(req.user.id, req.params.contactId);
      res.json({ message: "Trusted contact deleted" });
    } catch (err) {
      next(err);
    }
  }

  async triggerSos(req, res, next) {
    try {
      const result = await safetyService.triggerSos(req.user.id, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SafetyController();
