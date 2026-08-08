const savedPlaceRepository = require("../repositories/savedPlaceRepository");

class SavedPlaceService {
  async getPlaces(userId) {
    return savedPlaceRepository.findByUserId(userId);
  }

  async createPlace(userId, { name, latitude, longitude }) {
    if (!name || !latitude || !longitude) {
      const err = new Error("name, latitude, and longitude are required");
      err.status = 400;
      throw err;
    }
    return savedPlaceRepository.create({ userId, name, latitude, longitude });
  }

  async deletePlace(userId, placeId) {
    const place = await savedPlaceRepository.findById(placeId);
    if (!place) {
      const err = new Error("Saved place not found");
      err.status = 404;
      throw err;
    }
    if (place.userId !== userId) {
      const err = new Error("Forbidden");
      err.status = 403;
      throw err;
    }
    return savedPlaceRepository.delete(placeId);
  }
}

module.exports = new SavedPlaceService();
