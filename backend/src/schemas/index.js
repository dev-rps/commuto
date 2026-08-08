const { z } = require("zod");

// ── Common primitives ───────────────────────────────────────────────
const uuid = z.string().uuid();
const email = z.string().email("Invalid email address");
const nonEmptyString = z.string().trim().min(1, "Must not be empty");
const latitude = z.number().min(-90).max(90);
const longitude = z.number().min(-180).max(180);
const positiveInt = z.number().int().positive();
const positiveDecimal = z.number().positive();

// ── Password rule: min 8 chars, 1 digit, 1 special char ──────────────
const passwordRule = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[0-9]/, "Password must contain at least 1 digit")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least 1 special character");

// ── Auth schemas ────────────────────────────────────────────────────
const signupSchema = z.object({
  name: nonEmptyString,
  email,
  password: passwordRule,
  role: z.enum(["COMPANY_ADMIN", "EMPLOYEE"]).optional().default("EMPLOYEE"),
  organizationId: uuid,
});

const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

const updateMeSchema = z.object({
  name: nonEmptyString.optional(),
}).strict("Only self-editable profile fields are allowed");

// ── Vehicle schemas ─────────────────────────────────────────────────
const createVehicleSchema = z.object({
  model: nonEmptyString,
  registrationNo: nonEmptyString,
  seatingCap: positiveInt,
  fuelEfficiencyKmpl: z.number().positive().nullable().optional(),
});

const updateVehicleSchema = z.object({
  model: nonEmptyString.optional(),
  registrationNo: nonEmptyString.optional(),
  seatingCap: positiveInt.optional(),
  fuelEfficiencyKmpl: z.number().positive().nullable().optional(),
  isActive: z.boolean().optional(),
}).strict();

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

const searchRideSchema = z.object({
  pickupLat: z.coerce.number().min(-90).max(90),
  pickupLng: z.coerce.number().min(-180).max(180),
  destLat: z.coerce.number().min(-90).max(90),
  destLng: z.coerce.number().min(-180).max(180),
  date: z.string().optional(),
  seats: z.coerce.number().int().positive().optional().default(1),
  radiusKm: z.coerce.number().positive().optional().default(3),
});

const updateRideStatusSchema = z.object({
  status: z.enum(["PUBLISHED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
});

const updateLocationSchema = z.object({
  latitude,
  longitude,
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
  signupSchema,
  loginSchema,
  updateMeSchema,
  // Vehicles
  createVehicleSchema,
  updateVehicleSchema,
  // Rides
  createRideSchema,
  searchRideSchema,
  updateRideStatusSchema,
  updateLocationSchema,
  // Bookings
  createBookingSchema,
  // Payments
  initiatePaymentSchema,
  // Wallet
  rechargeWalletSchema,
  // Pagination
  paginationSchema,
};
