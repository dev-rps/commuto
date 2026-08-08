const rideRepository = require("../repositories/rideRepository");
const { getIO, SOCKET_EVENTS } = require("../sockets");

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

class RideService {
  async publishRide(driverId, rideData) {
    // SRS requirement: Driver must have at least one active vehicle
    const activeVehicles = await rideRepository.findDriverActiveVehicles(driverId);
    if (!activeVehicles || activeVehicles.length === 0) {
      const error = new Error(
        "Cannot publish ride: Driver does not have any active registered vehicles"
      );
      error.status = 400;
      throw error;
    }

    const targetVehicle = activeVehicles.find((v) => v.id === rideData.vehicleId);
    if (!targetVehicle) {
      const error = new Error(
        "Invalid vehicle: Selected vehicle is either inactive or does not belong to you"
      );
      error.status = 400;
      throw error;
    }

    return rideRepository.createRide({
      driverId,
      vehicleId: rideData.vehicleId,
      pickupLoc: rideData.pickupLoc,
      pickupLat: rideData.pickupLat,
      pickupLng: rideData.pickupLng,
      destination: rideData.destination,
      destLat: rideData.destLat,
      destLng: rideData.destLng,
      departureTime: new Date(rideData.departureTime),
      availableSeats: rideData.availableSeats,
      farePerSeat: rideData.farePerSeat,
      distanceKm: rideData.distanceKm ?? null,
    });
  }

  async getRide(rideId) {
    const ride = await rideRepository.findById(rideId);
    if (!ride) {
      const error = new Error('Ride not found');
      error.status = 404;
      throw error;
    }
    return ride;
  }

  async getMyRides(driverId) {
    return rideRepository.findByDriverId(driverId);
  }

  async searchRides({ pickupLat, pickupLng, destLat, destLng, date, seats = 1, radiusKm = 3 }) {
    let minTime = undefined;
    let maxTime = undefined;

    if (date) {
      const targetTime = new Date(date);
      if (!isNaN(targetTime.getTime())) {
        const windowMs = 30 * 60 * 1000; // ±30 minutes
        minTime = new Date(targetTime.getTime() - windowMs);
        maxTime = new Date(targetTime.getTime() + windowMs);
      }
    }

    const candidateRides = await rideRepository.findActiveRidesForSearch({
      minSeats: seats,
      minTime,
      maxTime,
    });

    const matchedRides = candidateRides
      .map((ride) => {
        const pickupDist = haversineDistanceKm(
          pickupLat,
          pickupLng,
          ride.pickupLat,
          ride.pickupLng
        );
        const destDist = haversineDistanceKm(
          destLat,
          destLng,
          ride.destLat,
          ride.destLng
        );

        const isMatch = pickupDist <= radiusKm && destDist <= radiusKm;
        const totalProximity = pickupDist + destDist;

        return {
          ride,
          pickupDistKm: Math.round(pickupDist * 100) / 100,
          destDistKm: Math.round(destDist * 100) / 100,
          totalProximity,
          isMatch,
        };
      })
      .filter((item) => item.isMatch)
      .sort((a, b) => a.totalProximity - b.totalProximity)
      .map((item) => ({
        ...item.ride,
        pickupDistKm: item.pickupDistKm,
        destDistKm: item.destDistKm,
      }));

    return matchedRides;
  }

  async updateRideStatus(rideId, driverId, newStatus) {
    const ride = await rideRepository.findById(rideId);
    if (!ride) {
      const error = new Error("Ride not found");
      error.status = 404;
      throw error;
    }

    // Driver only, own ride only
    if (ride.driverId !== driverId) {
      const error = new Error("Forbidden: You are not the driver of this ride");
      error.status = 403;
      throw error;
    }

    const updatedRide = await rideRepository.updateRide(rideId, { status: newStatus });

    // Socket notification
    try {
      const io = getIO();
      const eventName = SOCKET_EVENTS.rideStatus(rideId);
      const statusPayload = {
        rideId,
        status: newStatus,
        driverId: ride.driverId,
        timestamp: new Date().toISOString(),
      };

      // Emit to room for this ride
      io.to(`ride:${rideId}`).emit(eventName, statusPayload);

      // Also notify each passenger with non-cancelled booking in their user room
      if (ride.bookings && ride.bookings.length > 0) {
        const activePassengers = ride.bookings
          .filter((b) => b.status !== "CANCELLED")
          .map((b) => b.passengerId);

        activePassengers.forEach((passengerId) => {
          io.to(`user:${passengerId}`).emit(SOCKET_EVENTS.notificationNew(passengerId), {
            type: "RIDE_STATUS_CHANGE",
            title: `Ride Status: ${newStatus}`,
            body: `Your booked ride to ${ride.destination} is now ${newStatus}.`,
            rideId,
            status: newStatus,
          });
        });
      }
    } catch (socketErr) {
      console.warn("Socket notification warning:", socketErr.message);
    }

    return updatedRide;
  }

  async postLocation(rideId, driverId, { latitude, longitude }) {
    const ride = await rideRepository.findById(rideId);
    if (!ride) {
      const error = new Error("Ride not found");
      error.status = 404;
      throw error;
    }

    // Row-level driver ownership check
    if (ride.driverId !== driverId) {
      const error = new Error("Forbidden: Only the driver of this ride can post location updates");
      error.status = 403;
      throw error;
    }

    // Status check
    if (ride.status !== "IN_PROGRESS") {
      const error = new Error("Cannot post location: Ride is not currently IN_PROGRESS");
      error.status = 400;
      throw error;
    }

    const locationRecord = await rideRepository.createLocation({
      rideId,
      latitude,
      longitude,
    });

    // Emit live location via Socket.IO
    try {
      const io = getIO();
      const eventName = SOCKET_EVENTS.rideLocation(rideId);
      const locationPayload = {
        rideId,
        latitude,
        longitude,
        timestamp: locationRecord.timestamp,
      };

      // Broadcast to ride room
      io.to(`ride:${rideId}`).emit(eventName, locationPayload);
    } catch (socketErr) {
      console.warn("Socket location broadcast warning:", socketErr.message);
    }

    return locationRecord;
  }
}

module.exports = new RideService();
