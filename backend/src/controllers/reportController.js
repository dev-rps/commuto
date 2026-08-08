const reportService = require("../services/reportService");

class ReportController {
  async getSummary(req, res, next) {
    try {
      const report = await reportService.getSummary(req.user.organizationId);
      res.json(report);
    } catch (err) {
      next(err);
    }
  }

  async getPlatformOverview(req, res, next) {
    try {
      const overview = await reportService.getPlatformOverview();
      res.json(overview);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReportController();
