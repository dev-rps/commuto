const prisma = require("../lib/prismaClient");

class ReportRepository {
  /**
   * Get all COMPLETED rides where the driver belongs to the given organization.
   * Includes vehicle data for fuel efficiency calculations.
   */
  async getCompletedRidesForOrg(organizationId) {
    return prisma.ride.findMany({
      where: {
        status: "COMPLETED",
        driver: {
          organizationId,
        },
      },
      include: {
        vehicle: true,
        driver: {
          select: { id: true, name: true, organizationId: true },
        },
        bookings: {
          where: { status: { not: "CANCELLED" } },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Fetch organization-level cost configuration.
   */
  async getOrganization(organizationId) {
    return prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        fuelCostPerL: true,
        costPerKm: true,
      },
    });
  }

  /**
   * Get platform-wide overview stats, rides, transactions, and org metrics for Super Admin.
   */
  async getPlatformOverview() {
    const [orgs, usersCount, vehiclesCount, rides, bookings, payments, walletTxns] = await Promise.all([
      prisma.organization.findMany({
        include: {
          users: { select: { id: true, name: true, role: true } },
        },
      }),
      prisma.user.count(),
      prisma.vehicle.count(),
      prisma.ride.findMany({
        include: {
          driver: { select: { name: true, email: true, organization: { select: { name: true } } } },
          vehicle: { select: { model: true, registrationNo: true } },
          bookings: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.booking.findMany({
        include: {
          passenger: { select: { name: true, email: true } },
          ride: { select: { pickupLoc: true, destination: true } },
          payment: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.findMany({
        include: {
          booking: {
            include: {
              passenger: { select: { name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.walletTransaction.findMany({
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      orgs,
      usersCount,
      vehiclesCount,
      rides,
      bookings,
      payments,
      walletTxns,
    };
  }
}

module.exports = new ReportRepository();
