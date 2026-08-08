const savedPlaceService = require("../services/savedPlaceService");

class SavedPlaceController {
  async getPlaces(req, res, next) {
    try {
      const places = await savedPlaceService.getPlaces(req.user.id);
      res.json({ places });
    } catch (err) {
      next(err);
    }
  }

  async createPlace(req, res, next) {
    try {
      const place = await savedPlaceService.createPlace(req.user.id, req.body);
      res.status(201).json({ place });
    } catch (err) {
      next(err);
    }
  }

  async deletePlace(req, res, next) {
    try {
      await savedPlaceService.deletePlace(req.user.id, req.params.id);
      res.json({ message: "Saved place deleted" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SavedPlaceController();
