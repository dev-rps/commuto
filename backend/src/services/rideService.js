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

/**
 * Returns the minimum distance (in km) from point P to the line segment A→B.
 * All coordinates are decimal degrees (lat/lng).
 * Uses an equirectangular projection approximation — accurate for short segments.
 */
function pointToSegmentDistanceKm(pLat, pLng, aLat, aLng, bLat, bLng) {
  // Convert to approximate Cartesian in km (equirectangular)
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const midLat = toRad((aLat + bLat) / 2);

  const ax = toRad(aLng) * R * Math.cos(midLat);
  const ay = toRad(aLat) * R;
  const bx = toRad(bLng) * R * Math.cos(midLat);
  const by = toRad(bLat) * R;
  const px = toRad(pLng) * R * Math.cos(midLat);
  const py = toRad(pLat) * R;

  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    // Segment has zero length — just distance to endpoint A
    return Math.sqrt((px - ax) ** 2 + (py - ay) ** 2);
  }

  // Project point P onto the line, clamped to segment [0, 1]
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));

  const closestX = ax + t * dx;
  const closestY = ay + t * dy;

  return Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2);
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

    const newRide = await rideRepository.createRide({
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

    // Socket real-time notification for newly published ride scoped to company org
    try {
      const io = getIO();
      const driverOrgId = targetVehicle?.driver?.organizationId;
      if (driverOrgId) {
        const eventName = SOCKET_EVENTS.ridePublished(driverOrgId);
        io.to(`org:${driverOrgId}`).emit(eventName, {
          rideId: newRide.id,
          pickupLoc: newRide.pickupLoc,
          destination: newRide.destination,
          departureTime: newRide.departureTime,
          availableSeats: newRide.availableSeats,
          farePerSeat: newRide.farePerSeat,
          organizationId: driverOrgId,
        });
      }
    } catch (socketErr) {
      console.warn("Socket ridePublished emit warning:", socketErr.message);
    }

    return newRide;
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

  async searchRides({ pickupLat, pickupLng, destLat, destLng, pickupLoc, destination, date, time, departureTimeUtc, organizationId, seats = 1, radiusKm = 3 }) {
    // seats comes as a string from query params — coerce to int for Prisma's Int filter
    const minSeatsInt = parseInt(seats, 10) || 1;
    let minTime = undefined;
    let maxTime = undefined;

    if (departureTimeUtc) {
      const targetTime = new Date(departureTimeUtc);
      if (!isNaN(targetTime.getTime())) {
        const minus30m = 30 * 60 * 1000;
        const plus1h = 1 * 60 * 60 * 1000;
        minTime = new Date(targetTime.getTime() - minus30m);
        maxTime = new Date(targetTime.getTime() + plus1h);
      }
    } else if (date) {
      const dateStr = typeof date === 'string' ? date.split('T')[0] : new Date(date).toISOString().split('T')[0];

      if (time && typeof time === 'string') {
        const targetTime = new Date(`${dateStr}T${time}`);
        if (!isNaN(targetTime.getTime())) {
          const minus30m = 30 * 60 * 1000;
          const plus1h = 1 * 60 * 60 * 1000;
          minTime = new Date(targetTime.getTime() - minus30m);
          maxTime = new Date(targetTime.getTime() + plus1h);
        }
      }

      if (!minTime) {
        const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
        const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
        if (!isNaN(startOfDay.getTime()) && !isNaN(endOfDay.getTime())) {
          minTime = startOfDay;
          maxTime = endOfDay;
        }
      }
    // When no date is specified, do NOT filter by time — show all PUBLISHED rides.
    // Setting minTime=now() would hide rides whose departure time has already passed,
    // which breaks testing/localhost flows where rides may have a recent departure time.
    }

    const candidateRides = await rideRepository.findActiveRidesForSearch({
      minSeats: minSeatsInt,
      minTime,
      maxTime,
      organizationId,
    });

    const CORRIDOR_KM = 0.5; // 500 m along-route corridor

    const matchedRides = candidateRides
      .map((ride) => {
        let pickupDist = 0;
        let destDist = 0;
        let isGeoMatch = true;

        const hasGeoSearch = pickupLat != null && pickupLng != null && destLat != null && destLng != null;
        const rideHasCoords = ride.pickupLat != null && ride.pickupLng != null && ride.destLat != null && ride.destLng != null;

        if (hasGeoSearch && rideHasCoords) {
          // ── Corridor check (primary) ────────────────────────────────────────────
          // Is the searcher's pickup within 500m of the ride's route segment?
          const searcherPickupToRoute = pointToSegmentDistanceKm(
            pickupLat, pickupLng,
            ride.pickupLat, ride.pickupLng,
            ride.destLat, ride.destLng
          );

          // Is the searcher's destination within 500m of the ride's route segment?
          const searcherDestToRoute = pointToSegmentDistanceKm(
            destLat, destLng,
            ride.pickupLat, ride.pickupLng,
            ride.destLat, ride.destLng
          );

          // ── Directionality check ──────────────────────────────────────────────
          // Ensure the passenger's trip direction roughly aligns with the ride.
          // We do this by verifying searcher's pickup is "before" their destination
          // along the ride's direction (t_pickup <= t_dest on the segment).
          // This prevents reverse-direction matches.
          const toRad = (d) => (d * Math.PI) / 180;
          const midLat = toRad((ride.pickupLat + ride.destLat) / 2);
          const Rr = 6371;
          const ax = toRad(ride.pickupLng) * Rr * Math.cos(midLat);
          const ay = toRad(ride.pickupLat) * Rr;
          const bx = toRad(ride.destLng) * Rr * Math.cos(midLat);
          const by = toRad(ride.destLat) * Rr;
          const dx = bx - ax; const dy = by - ay;
          const lenSq = dx * dx + dy * dy;

          let isSameDirection = true;
          if (lenSq > 0) {
            const px1 = toRad(pickupLng) * Rr * Math.cos(midLat);
            const py1 = toRad(pickupLat) * Rr;
            const px2 = toRad(destLng) * Rr * Math.cos(midLat);
            const py2 = toRad(destLat) * Rr;
            const t1 = ((px1 - ax) * dx + (py1 - ay) * dy) / lenSq;
            const t2 = ((px2 - ax) * dx + (py2 - ay) * dy) / lenSq;
            // Allow if searcher's pickup is before their destination on the route
            isSameDirection = t1 <= t2 + 0.15; // small tolerance
          }

          const isCorridorMatch =
            searcherPickupToRoute <= CORRIDOR_KM &&
            searcherDestToRoute <= CORRIDOR_KM &&
            isSameDirection;

          // ── Fallback: original endpoint proximity (3 km) ──────────────────────
          pickupDist = haversineDistanceKm(pickupLat, pickupLng, ride.pickupLat, ride.pickupLng);
          destDist = haversineDistanceKm(destLat, destLng, ride.destLat, ride.destLng);
          const isEndpointMatch = pickupDist <= radiusKm && destDist <= radiusKm;

          isGeoMatch = isCorridorMatch || isEndpointMatch;
        } else if (hasGeoSearch && !rideHasCoords) {
          isGeoMatch = false;
        }

        let isTextMatch = true;
        if (pickupLoc && pickupLoc.trim()) {
          const pLocNorm = pickupLoc.trim().toLowerCase();
          const rPickupNorm = (ride.pickupLoc || "").toLowerCase();
          if (!rPickupNorm.includes(pLocNorm) && !pLocNorm.includes(rPickupNorm)) {
            isTextMatch = false;
          }
        }
        if (destination && destination.trim()) {
          const dLocNorm = destination.trim().toLowerCase();
          const rDestNorm = (ride.destination || "").toLowerCase();
          if (!rDestNorm.includes(dLocNorm) && !dLocNorm.includes(rDestNorm)) {
            isTextMatch = false;
          }
        }

        const isMatch = hasGeoSearch ? isGeoMatch : isTextMatch;
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

    if (ride.status === "COMPLETED" || ride.status === "CANCELLED") {
      const error = new Error(`Cannot change status of a ${ride.status} ride`);
      error.status = 400;
      throw error;
    }

    if (newStatus === "CANCELLED") {
      if (ride.status === "IN_PROGRESS") {
        const error = new Error("Cannot cancel an in-progress ride");
        error.status = 400;
        throw error;
      }
      const activeBookings = (ride.bookings || []).filter(
        (b) => b.status !== "CANCELLED"
      );
      if (activeBookings.length > 0) {
        const error = new Error("Cannot cancel ride: there are active bookings");
        error.status = 400;
        throw error;
      }
    }

    const updatedRide = await rideRepository.updateRide(rideId, { status: newStatus });

    // Transition bookings to PAYMENT_PENDING if ride is COMPLETED
    if (newStatus === "COMPLETED") {
      const prisma = require("../lib/prismaClient");
      await prisma.booking.updateMany({
        where: { rideId, status: "BOOKED" },
        data: { status: "PAYMENT_PENDING" },
      });
    }

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

  async startRide(rideId, driverId, otp) {
    const ride = await rideRepository.findById(rideId);
    if (!ride) {
      const error = new Error("Ride not found");
      error.status = 404;
      throw error;
    }
    
    if (ride.driverId !== driverId) {
      const error = new Error("Forbidden: You are not the driver of this ride");
      error.status = 403;
      throw error;
    }

    if (ride.status !== "AT_PICKUP" && ride.status !== "PUBLISHED") {
      const error = new Error("Ride must be AT_PICKUP to start");
      error.status = 400;
      throw error;
    }

    // Verify OTP against any passenger's booking
    const activeBookings = ride.bookings.filter(b => b.status === "BOOKED" || b.status === "PAYMENT_COMPLETED");
    if (activeBookings.length === 0) {
      const error = new Error("No active bookings to start this ride");
      error.status = 400;
      throw error;
    }

    const isValidOtp = activeBookings.some(b => b.otp === otp);
    if (!isValidOtp) {
      const error = new Error("Invalid OTP");
      error.status = 400;
      throw error;
    }

    return this.updateRideStatus(rideId, driverId, "IN_PROGRESS");
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
