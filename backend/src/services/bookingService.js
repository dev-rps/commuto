const prisma = require("../lib/prismaClient");
const bookingRepository = require("../repositories/bookingRepository");

class BookingService {
  /**
   * Book seats on a ride — uses Prisma interactive transaction to prevent
   * overselling when two passengers book simultaneously.
   */
  async bookRide(rideId, passengerId, { seatsBooked }) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch the ride inside the transaction
      const ride = await tx.ride.findUnique({
        where: { id: rideId },
      });

      if (!ride) {
        const error = new Error("Ride not found");
        error.status = 404;
        throw error;
      }

      // 2. Cannot book your own ride
      if (ride.driverId === passengerId) {
        const error = new Error("Cannot book your own ride");
        error.status = 400;
        throw error;
      }

      // 3. Ride must be PUBLISHED to accept bookings
      if (ride.status !== "PUBLISHED") {
        const error = new Error(
          "Cannot book this ride: ride is not currently accepting bookings"
        );
        error.status = 400;
        throw error;
      }

      // 4. Seat availability check
      if (ride.availableSeats < seatsBooked) {
        const error = new Error(
          `Not enough seats available. Requested: ${seatsBooked}, Available: ${ride.availableSeats}`
        );
        error.status = 400;
        throw error;
      }

      // 5. Calculate total fare
      const totalFare = seatsBooked * Number(ride.farePerSeat);

      // 6. Atomically decrement available seats
      await tx.ride.update({
        where: { id: rideId },
        data: { availableSeats: { decrement: seatsBooked } },
      });

      // 6.5 Generate a random 4-digit OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      // 7. Create the booking
      const booking = await tx.booking.create({
        data: {
          rideId,
          passengerId,
          seatsBooked,
          totalFare,
          otp,
        },
        include: {
          ride: {
            include: {
              vehicle: true,
              driver: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          passenger: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return booking;
    });
  }

  /**
   * Get all bookings for the authenticated passenger.
   */
  async getMyBookings(passengerId) {
    return bookingRepository.findByPassengerId(passengerId);
  }

  /**
   * Cancel a booking — only the booking owner, only if status is BOOKED.
   * Restores seat count on the ride atomically.
   */
  async cancelBooking(bookingId, passengerId) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { ride: true },
      });

      if (!booking) {
        const error = new Error("Booking not found");
        error.status = 404;
        throw error;
      }

      // Ownership check — not just role, the actual passenger
      if (booking.passengerId !== passengerId) {
        const error = new Error("Forbidden: You can only cancel your own bookings");
        error.status = 403;
        throw error;
      }

      // Can only cancel if status is still BOOKED (not after payment)
      if (booking.status !== "BOOKED") {
        const error = new Error(
          `Cannot cancel booking with status "${booking.status}". Only BOOKED bookings can be cancelled.`
        );
        error.status = 400;
        throw error;
      }

      // Cannot cancel if the ride has already started or completed
      if (booking.ride.status !== "PUBLISHED") {
        const error = new Error(
          `Cannot cancel booking because the ride is already ${booking.ride.status}.`
        );
        error.status = 400;
        throw error;
      }

      // Restore seats on the ride
      await tx.ride.update({
        where: { id: booking.rideId },
        data: { availableSeats: { increment: booking.seatsBooked } },
      });

      // Update booking status
      const cancelled = await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" },
        include: {
          ride: {
            include: {
              vehicle: true,
              driver: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          passenger: {
            select: { id: true, name: true, email: true },
          },
          payment: true,
        },
      });

      return cancelled;
    });
  }
}

module.exports = new BookingService();
