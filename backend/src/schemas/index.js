/**
 * Shared Zod schemas — validation-first from day one.
 *
 * Every API module imports/extends schemas from here.
 * This was skipped under pressure last hackathon and became a
 * should-fix item in the final audit. Not skipping it this time.
 */

const { z } = require("zod");

// ── Common primitives ───────────────────────────────────────────────
const uuid = z.string().uuid();
const email = z.string().email();
const nonEmptyString = z.string().min(1, "Must not be empty");
const latitude = z.number().min(-90).max(90);
const longitude = z.number().min(-180).max(180);
const positiveInt = z.number().int().positive();
const positiveDecimal = z.number().positive();

// ── Auth schemas ────────────────────────────────────────────────────
const registerSchema = z.object({
  name: nonEmptyString,
  email,
  password: z.string().min(6, "Password must be at least 6 characters"),
  organizationId: uuid,
});

const loginSchema = z.object({
  email,
  password: nonEmptyString,
});

// ── Vehicle schemas ─────────────────────────────────────────────────
const createVehicleSchema = z.object({
  model: nonEmptyString,
  registrationNo: nonEmptyString,
  seatingCap: positiveInt,
  fuelEfficiencyKmpl: z.number().positive().nullable().optional(),
});

// ── Ride schemas ────────────────────────────────────────────────────
const createRideSchema = z.object({
  vehicleId: uuid,
  pickupLoc: nonEmptyString,
  pickupLat: latitude,
  pickupLng: longitude,
  destination: nonEmptyString,
  destLat: latitude,
  destLng: longitude,
  departureTime: z.string().datetime(),
  availableSeats: positiveInt,
  farePerSeat: positiveDecimal,
  distanceKm: z.number().positive().nullable().optional(),
});

// ── Booking schemas ─────────────────────────────────────────────────
const createBookingSchema = z.object({
  rideId: uuid,
  seatsBooked: positiveInt,
});

// ── Payment schemas ─────────────────────────────────────────────────
const initiatePaymentSchema = z.object({
  bookingId: uuid,
  method: z.enum(["CASH", "CARD", "UPI", "WALLET"]),
});

// ── Wallet schemas ──────────────────────────────────────────────────
const rechargeWalletSchema = z.object({
  amount: positiveDecimal,
});

// ── Pagination ──────────────────────────────────────────────────────
const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

module.exports = {
  // Primitives
  uuid,
  email,
  nonEmptyString,
  latitude,
  longitude,
  positiveInt,
  positiveDecimal,
  // Auth
  registerSchema,
  loginSchema,
  // Vehicles
  createVehicleSchema,
  // Rides
  createRideSchema,
  // Bookings
  createBookingSchema,
  // Payments
  initiatePaymentSchema,
  // Wallet
  rechargeWalletSchema,
  // Pagination
  paginationSchema,
};
