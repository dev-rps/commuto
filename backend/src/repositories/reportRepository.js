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
}

module.exports = new ReportRepository();
