const reportRepository = require("../repositories/reportRepository");

class ReportService {
  /**
   * Generate summary report scoped to the admin's organization.
   * Never leaks cross-org data — all queries filter by organizationId.
   */
  async getSummary(organizationId) {
    const [rides, org] = await Promise.all([
      reportRepository.getCompletedRidesForOrg(organizationId),
      reportRepository.getOrganization(organizationId),
    ]);

    if (!org) {
      const error = new Error("Organization not found");
      error.status = 404;
      throw error;
    }

    const fuelCostPerL = Number(org.fuelCostPerL);
    const costPerKm = Number(org.costPerKm);

    // ── Totals ──────────────────────────────────────────────────────
    const totalTrips = rides.length;
    const totalDistance = rides.reduce(
      (sum, r) => sum + (r.distanceKm || 0),
      0
    );
    const totalPassengers = rides.reduce(
      (sum, r) => sum + r.bookings.reduce((bs, b) => bs + b.seatsBooked, 0),
      0
    );

    // ── Vehicle-wise breakdown ──────────────────────────────────────
    const vehicleMap = {};

    rides.forEach((ride) => {
      const vid = ride.vehicleId;
      if (!vehicleMap[vid]) {
        vehicleMap[vid] = {
          vehicleId: vid,
          model: ride.vehicle.model,
          registrationNo: ride.vehicle.registrationNo,
          fuelEfficiencyKmpl: ride.vehicle.fuelEfficiencyKmpl,
          totalTrips: 0,
          totalDistanceKm: 0,
          fuelConsumedL: 0,
          fuelCost: 0,
          distanceCost: 0,
        };
      }

      const v = vehicleMap[vid];
      v.totalTrips += 1;
      const dist = ride.distanceKm || 0;
      v.totalDistanceKm += dist;

      // Fuel consumed = distance / fuel efficiency (km/L)
      if (v.fuelEfficiencyKmpl && v.fuelEfficiencyKmpl > 0) {
        const fuel = dist / v.fuelEfficiencyKmpl;
        v.fuelConsumedL += fuel;
        v.fuelCost += fuel * fuelCostPerL;
      }

      v.distanceCost += dist * costPerKm;
    });

    const vehicleBreakdown = Object.values(vehicleMap).map((v) => ({
      ...v,
      totalDistanceKm: Math.round(v.totalDistanceKm * 100) / 100,
      fuelConsumedL: Math.round(v.fuelConsumedL * 100) / 100,
      fuelCost: Math.round(v.fuelCost * 100) / 100,
      distanceCost: Math.round(v.distanceCost * 100) / 100,
      totalCost:
        Math.round((v.fuelCost + v.distanceCost) * 100) / 100,
    }));

    // ── Total fuel consumption ──────────────────────────────────────
    const totalFuelConsumed = vehicleBreakdown.reduce(
      (sum, v) => sum + v.fuelConsumedL,
      0
    );
    const totalFuelCost = vehicleBreakdown.reduce(
      (sum, v) => sum + v.fuelCost,
      0
    );

    // ── Fuel efficiency trends (monthly averages) ───────────────────
    const monthlyMap = {};

    rides.forEach((ride) => {
      const date = new Date(ride.createdAt);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthKey,
          totalDistanceKm: 0,
          totalFuelConsumedL: 0,
          tripCount: 0,
        };
      }

      const m = monthlyMap[monthKey];
      const dist = ride.distanceKm || 0;
      m.totalDistanceKm += dist;
      m.tripCount += 1;

      if (
        ride.vehicle.fuelEfficiencyKmpl &&
        ride.vehicle.fuelEfficiencyKmpl > 0
      ) {
        m.totalFuelConsumedL += dist / ride.vehicle.fuelEfficiencyKmpl;
      }
    });

    const fuelEfficiencyTrends = Object.values(monthlyMap)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((m) => ({
        month: m.month,
        totalDistanceKm: Math.round(m.totalDistanceKm * 100) / 100,
        totalFuelConsumedL: Math.round(m.totalFuelConsumedL * 100) / 100,
        avgEfficiencyKmpl:
          m.totalFuelConsumedL > 0
            ? Math.round((m.totalDistanceKm / m.totalFuelConsumedL) * 100) / 100
            : null,
        tripCount: m.tripCount,
      }));

    return {
      organization: {
        id: org.id,
        name: org.name,
        fuelCostPerL,
        costPerKm,
      },
      summary: {
        totalTrips,
        totalDistance: Math.round(totalDistance * 100) / 100,
        totalPassengers,
        totalFuelConsumed: Math.round(totalFuelConsumed * 100) / 100,
        totalFuelCost: Math.round(totalFuelCost * 100) / 100,
        costPerKm,
      },
      vehicleBreakdown,
      fuelEfficiencyTrends,
    };
  }

  async getPlatformOverview() {
    return reportRepository.getPlatformOverview();
  }
}

module.exports = new ReportService();
