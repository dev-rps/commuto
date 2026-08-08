const recurringService = require("../services/recurringService");

class RecurringController {
  async create(req, res, next) {
    try {
      const schedule = await recurringService.createRecurringRide(req.user.id, req.body);
      res.status(201).json({ message: "Recurring commute subscription created", schedule });
    } catch (err) {
      next(err);
    }
  }

  async getMySchedules(req, res, next) {
    try {
      const schedules = await recurringService.getMyRecurringRides(req.user.id);
      res.json({ schedules });
    } catch (err) {
      next(err);
    }
  }

  async deleteSchedule(req, res, next) {
    try {
      await recurringService.deleteRecurringRide(req.user.id, req.params.id);
      res.json({ message: "Recurring commute subscription cancelled" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new RecurringController();
