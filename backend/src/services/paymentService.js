const crypto = require("crypto");
const prisma = require("../lib/prismaClient");
const bookingRepository = require("../repositories/bookingRepository");
const paymentRepository = require("../repositories/paymentRepository");

/**
 * Lazily initialize Razorpay — only when CARD/UPI is used.
 * This avoids crashing on startup if keys aren't set (e.g. during CASH/WALLET-only testing).
 */
let _razorpay = null;
function getRazorpay() {
  if (!_razorpay) {
    const Razorpay = require("razorpay");
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      const error = new Error(
        "Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env"
      );
      error.status = 500;
      throw error;
    }
    _razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return _razorpay;
}

class PaymentService {
  /**
   * Initiate payment for a booking.
   *
   * CASH  → Payment SUCCESS immediately, Booking → PAYMENT_COMPLETED
   * WALLET → Deduct from walletBalance in a transaction with WalletTransaction row
   * CARD/UPI → Create Razorpay order, return order details to frontend
   */
  async initiatePayment(bookingId, userId, { method }) {
    const booking = await bookingRepository.findById(bookingId);

    if (!booking) {
      const error = new Error("Booking not found");
      error.status = 404;
      throw error;
    }

    // Ownership check — only the passenger who made the booking
    if (booking.passengerId !== userId) {
      const error = new Error("Forbidden: You can only pay for your own bookings");
      error.status = 403;
      throw error;
    }

    // Status check — must be PAYMENT_PENDING to initiate payment for completed rides, or BOOKED
    if (booking.status !== "BOOKED" && booking.status !== "PAYMENT_PENDING") {
      const error = new Error(
        `Cannot initiate payment: booking status is "${booking.status}", expected "BOOKED" or "PAYMENT_PENDING"`
      );
      error.status = 400;
      throw error;
    }

    // Check for existing successful payment
    const existingPayment = await paymentRepository.findByBookingId(bookingId);
    if (existingPayment && existingPayment.status === "SUCCESS") {
      const error = new Error("Payment has already been completed for this booking");
      error.status = 400;
      throw error;
    }

    const amount = Number(booking.totalFare);

    // ── CASH ──────────────────────────────────────────────────────────
    if (method === "CASH") {
      return prisma.$transaction(async (tx) => {
        const payment = await tx.payment.create({
          data: {
            bookingId,
            method: "CASH",
            amount,
            status: "SUCCESS",
          },
        });

        await tx.booking.update({
          where: { id: bookingId },
          data: { status: "PAYMENT_COMPLETED" },
        });

        return { payment, message: "Cash payment recorded successfully" };
      });
    }

    // ── WALLET ────────────────────────────────────────────────────────
    if (method === "WALLET") {
      return prisma.$transaction(async (tx) => {
        // Fetch current wallet balance inside transaction
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { walletBalance: true },
        });

        const currentBalance = Number(user.walletBalance);

        if (currentBalance < amount) {
          const error = new Error(
            `Insufficient wallet balance. Required: ₹${amount}, Available: ₹${currentBalance}`
          );
          error.status = 400;
          throw error;
        }

        const newBalance = currentBalance - amount;

        // Deduct balance
        await tx.user.update({
          where: { id: userId },
          data: { walletBalance: newBalance },
        });

        // Insert WalletTransaction row for passenger
        await tx.walletTransaction.create({
          data: {
            userId,
            type: "RIDE_PAYMENT",
            amount,
            balanceAfter: newBalance,
          },
        });

        // Credit driver's wallet
        const driverId = booking.ride.driver.id;
        const driver = await tx.user.findUnique({
          where: { id: driverId },
          select: { walletBalance: true },
        });
        const newDriverBalance = Number(driver.walletBalance) + amount;
        await tx.user.update({
          where: { id: driverId },
          data: { walletBalance: newDriverBalance },
        });
        await tx.walletTransaction.create({
          data: {
            userId: driverId,
            type: "RIDE_PAYMENT",
            amount,
            balanceAfter: newDriverBalance,
          },
        });

        // Create payment record
        const payment = await tx.payment.create({
          data: {
            bookingId,
            method: "WALLET",
            amount,
            status: "SUCCESS",
          },
        });

        // Update booking status
        await tx.booking.update({
          where: { id: bookingId },
          data: { status: "PAYMENT_COMPLETED" },
        });

        return {
          payment,
          walletBalance: newBalance,
          message: "Wallet payment completed successfully",
        };
      });
    }

    // ── CARD / UPI (Razorpay) ─────────────────────────────────────────
    if (method === "CARD" || method === "UPI") {
      const razorpay = getRazorpay();

      // Create Razorpay order (amount in paise)
      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `booking_${bookingId}`,
        notes: {
          bookingId,
          passengerId: userId,
        },
      });

      // Create payment record with PENDING status
      const payment = await paymentRepository.createPayment({
        bookingId,
        method,
        amount,
        status: "PENDING",
        gatewayRefId: order.id,
      });

      return {
        payment,
        razorpay: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
        },
        message: "Razorpay order created. Complete payment on frontend.",
      };
    }
  }

  /**
   * Verify Razorpay payment signature after frontend completes payment.
   * Standard Razorpay verification: HMAC-SHA256(orderId|paymentId, secret)
   */
  async verifyPayment(bookingId, userId, { razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    const booking = await bookingRepository.findById(bookingId);

    if (!booking) {
      const error = new Error("Booking not found");
      error.status = 404;
      throw error;
    }

    // Ownership check
    if (booking.passengerId !== userId) {
      const error = new Error("Forbidden: You can only verify payment for your own bookings");
      error.status = 403;
      throw error;
    }

    // Find the pending payment
    const payment = await paymentRepository.findByBookingId(bookingId);
    if (!payment) {
      const error = new Error("No payment found for this booking");
      error.status = 404;
      throw error;
    }

    if (payment.status === "SUCCESS") {
      const error = new Error("Payment has already been verified");
      error.status = 400;
      throw error;
    }

    // Verify the gateway ref matches
    if (payment.gatewayRefId !== razorpay_order_id) {
      const error = new Error("Order ID mismatch");
      error.status = 400;
      throw error;
    }

    // Verify Razorpay signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Mark payment as failed
      await paymentRepository.updatePayment(payment.id, { status: "FAILED" });

      const error = new Error("Payment verification failed: invalid signature");
      error.status = 400;
      throw error;
    }

    // Signature valid — update payment and booking in a transaction
    return prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCESS",
          gatewayRefId: razorpay_payment_id,
        },
      });

      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "PAYMENT_COMPLETED" },
      });

      // Credit driver's wallet for Razorpay
      const amount = Number(payment.amount);
      const driverId = booking.ride.driver.id;
      const driver = await tx.user.findUnique({
        where: { id: driverId },
        select: { walletBalance: true },
      });
      const newDriverBalance = Number(driver.walletBalance) + amount;
      await tx.user.update({
        where: { id: driverId },
        data: { walletBalance: newDriverBalance },
      });
      await tx.walletTransaction.create({
        data: {
          userId: driverId,
          type: "RIDE_PAYMENT",
          amount,
          balanceAfter: newDriverBalance,
        },
      });

      return {
        payment: updatedPayment,
        message: "Payment verified and booking confirmed",
      };
    });
  }
}

module.exports = new PaymentService();
