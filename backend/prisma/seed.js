require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const crypto = require("crypto");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });


// Simple password hash (SHA-256) — NOT for production, fine for seed/demo
function hashPassword(plain) {
  return crypto.createHash("sha256").update(plain).digest("hex");
}

async function main() {
  console.log("🌱 Seeding Commuto database...\n");

  // ─── Organizations ───────────────────────────────────────────────
  const org1 = await prisma.organization.create({
    data: {
      name: "Infosys Ltd",
      fuelCostPerL: 104.50,
      costPerKm: 8.00,
    },
  });

  const org2 = await prisma.organization.create({
    data: {
      name: "Wipro Technologies",
      fuelCostPerL: 101.25,
      costPerKm: 7.50,
    },
  });

  console.log("✅ 2 Organizations created");

  // ─── Users ───────────────────────────────────────────────────────
  const defaultHash = hashPassword("password123");

  const admin1 = await prisma.user.create({
    data: {
      organizationId: org1.id,
      name: "Arjun Mehta",
      email: "arjun.mehta@infosys.com",
      passwordHash: defaultHash,
      role: "COMPANY_ADMIN",
      walletBalance: 0,
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      organizationId: org2.id,
      name: "Priya Sharma",
      email: "priya.sharma@wipro.com",
      passwordHash: defaultHash,
      role: "COMPANY_ADMIN",
      walletBalance: 0,
    },
  });

  // Employees — Org 1 (Infosys)
  const emp1 = await prisma.user.create({
    data: {
      organizationId: org1.id,
      name: "Rahul Nair",
      email: "rahul.nair@infosys.com",
      passwordHash: defaultHash,
      walletBalance: 500.00,
    },
  });

  const emp2 = await prisma.user.create({
    data: {
      organizationId: org1.id,
      name: "Sneha Reddy",
      email: "sneha.reddy@infosys.com",
      passwordHash: defaultHash,
      walletBalance: 350.00,
    },
  });

  const emp3 = await prisma.user.create({
    data: {
      organizationId: org1.id,
      name: "Vikram Joshi",
      email: "vikram.joshi@infosys.com",
      passwordHash: defaultHash,
      walletBalance: 200.00,
    },
  });

  const emp4 = await prisma.user.create({
    data: {
      organizationId: org1.id,
      name: "Ananya Gupta",
      email: "ananya.gupta@infosys.com",
      passwordHash: defaultHash,
      walletBalance: 750.00,
    },
  });

  // Employees — Org 2 (Wipro)
  const emp5 = await prisma.user.create({
    data: {
      organizationId: org2.id,
      name: "Karthik Iyer",
      email: "karthik.iyer@wipro.com",
      passwordHash: defaultHash,
      walletBalance: 600.00,
    },
  });

  const emp6 = await prisma.user.create({
    data: {
      organizationId: org2.id,
      name: "Divya Krishnan",
      email: "divya.krishnan@wipro.com",
      passwordHash: defaultHash,
      walletBalance: 450.00,
    },
  });

  const emp7 = await prisma.user.create({
    data: {
      organizationId: org2.id,
      name: "Rohan Patel",
      email: "rohan.patel@wipro.com",
      passwordHash: defaultHash,
      walletBalance: 300.00,
    },
  });

  const emp8 = await prisma.user.create({
    data: {
      organizationId: org2.id,
      name: "Meera Bhat",
      email: "meera.bhat@wipro.com",
      passwordHash: defaultHash,
      walletBalance: 150.00,
    },
  });

  console.log("✅ 2 Admins + 8 Employees created");

  // ─── Vehicles ────────────────────────────────────────────────────
  const v1 = await prisma.vehicle.create({
    data: {
      driverId: emp1.id,
      model: "Maruti Suzuki Swift",
      registrationNo: "KA-01-AB-1234",
      seatingCap: 4,
      fuelEfficiencyKmpl: 22.0,
    },
  });

  const v2 = await prisma.vehicle.create({
    data: {
      driverId: emp2.id,
      model: "Hyundai Creta",
      registrationNo: "KA-01-CD-5678",
      seatingCap: 5,
      fuelEfficiencyKmpl: 16.5,
    },
  });

  const v3 = await prisma.vehicle.create({
    data: {
      driverId: emp5.id,
      model: "Honda City",
      registrationNo: "KA-02-EF-9012",
      seatingCap: 4,
      fuelEfficiencyKmpl: 18.0,
    },
  });

  const v4 = await prisma.vehicle.create({
    data: {
      driverId: emp6.id,
      model: "Toyota Innova Crysta",
      registrationNo: "KA-03-GH-3456",
      seatingCap: 7,
      fuelEfficiencyKmpl: 12.0,
    },
  });

  const v5 = await prisma.vehicle.create({
    data: {
      driverId: emp4.id,
      model: "Tata Nexon EV",
      registrationNo: "KA-01-EV-7890",
      seatingCap: 4,
      fuelEfficiencyKmpl: null, // EV — no fuel efficiency
    },
  });

  console.log("✅ 5 Vehicles created");

  // ─── Rides (Bangalore coordinates) ──────────────────────────────
  // Real Bangalore landmarks for sensible map rendering
  const now = new Date();
  const hourMs = 60 * 60 * 1000;

  const ride1 = await prisma.ride.create({
    data: {
      driverId: emp1.id,
      vehicleId: v1.id,
      pickupLoc: "Koramangala, Bangalore",
      pickupLat: 12.9352,
      pickupLng: 77.6245,
      destination: "Electronic City, Bangalore",
      destLat: 12.8399,
      destLng: 77.6770,
      departureTime: new Date(now.getTime() + 2 * hourMs), // 2h from now
      availableSeats: 3,
      farePerSeat: 80.00,
      distanceKm: 16.5,
      status: "PUBLISHED",
    },
  });

  const ride2 = await prisma.ride.create({
    data: {
      driverId: emp2.id,
      vehicleId: v2.id,
      pickupLoc: "Whitefield, Bangalore",
      pickupLat: 12.9698,
      pickupLng: 77.7500,
      destination: "MG Road, Bangalore",
      destLat: 12.9756,
      destLng: 77.6065,
      departureTime: new Date(now.getTime() + 5 * hourMs), // 5h from now
      availableSeats: 4,
      farePerSeat: 120.00,
      distanceKm: 22.0,
      status: "PUBLISHED",
    },
  });

  const ride3 = await prisma.ride.create({
    data: {
      driverId: emp5.id,
      vehicleId: v3.id,
      pickupLoc: "Indiranagar, Bangalore",
      pickupLat: 12.9784,
      pickupLng: 77.6408,
      destination: "Marathahalli, Bangalore",
      destLat: 12.9591,
      destLng: 77.6974,
      departureTime: new Date(now.getTime() - 3 * hourMs), // 3h ago (past)
      availableSeats: 0,
      farePerSeat: 60.00,
      distanceKm: 8.5,
      status: "COMPLETED",
    },
  });

  const ride4 = await prisma.ride.create({
    data: {
      driverId: emp6.id,
      vehicleId: v4.id,
      pickupLoc: "Jayanagar, Bangalore",
      pickupLat: 12.9299,
      pickupLng: 77.5838,
      destination: "Hebbal, Bangalore",
      destLat: 13.0358,
      destLng: 77.5970,
      departureTime: new Date(now.getTime() - 1 * hourMs), // 1h ago (in progress)
      availableSeats: 4,
      farePerSeat: 100.00,
      distanceKm: 14.0,
      status: "IN_PROGRESS",
    },
  });

  const ride5 = await prisma.ride.create({
    data: {
      driverId: emp4.id,
      vehicleId: v5.id,
      pickupLoc: "HSR Layout, Bangalore",
      pickupLat: 12.9116,
      pickupLng: 77.6389,
      destination: "Yelahanka, Bangalore",
      destLat: 13.1007,
      destLng: 77.5963,
      departureTime: new Date(now.getTime() + 24 * hourMs), // tomorrow
      availableSeats: 3,
      farePerSeat: 150.00,
      distanceKm: 28.0,
      status: "PUBLISHED",
    },
  });

  const ride6 = await prisma.ride.create({
    data: {
      driverId: emp1.id,
      vehicleId: v1.id,
      pickupLoc: "BTM Layout, Bangalore",
      pickupLat: 12.9166,
      pickupLng: 77.6101,
      destination: "Whitefield, Bangalore",
      destLat: 12.9698,
      destLng: 77.7500,
      departureTime: new Date(now.getTime() - 24 * hourMs), // yesterday (past)
      availableSeats: 1,
      farePerSeat: 110.00,
      distanceKm: 20.0,
      status: "COMPLETED",
    },
  });

  console.log("✅ 6 Rides created (2 past, 1 in-progress, 3 future)");

  // ─── Bookings ────────────────────────────────────────────────────
  const booking1 = await prisma.booking.create({
    data: {
      rideId: ride1.id,
      passengerId: emp3.id,
      seatsBooked: 1,
      totalFare: 80.00,
      status: "BOOKED",
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      rideId: ride2.id,
      passengerId: emp7.id,
      seatsBooked: 2,
      totalFare: 240.00,
      status: "PAYMENT_PENDING",
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      rideId: ride3.id,
      passengerId: emp3.id,
      seatsBooked: 1,
      totalFare: 60.00,
      status: "PAYMENT_COMPLETED",
    },
  });

  const booking4 = await prisma.booking.create({
    data: {
      rideId: ride3.id,
      passengerId: emp8.id,
      seatsBooked: 2,
      totalFare: 120.00,
      status: "PAYMENT_COMPLETED",
    },
  });

  const booking5 = await prisma.booking.create({
    data: {
      rideId: ride4.id,
      passengerId: emp3.id,
      seatsBooked: 1,
      totalFare: 100.00,
      status: "BOOKED",
    },
  });

  const booking6 = await prisma.booking.create({
    data: {
      rideId: ride6.id,
      passengerId: emp5.id,
      seatsBooked: 2,
      totalFare: 220.00,
      status: "CANCELLED",
    },
  });

  const booking7 = await prisma.booking.create({
    data: {
      rideId: ride5.id,
      passengerId: emp7.id,
      seatsBooked: 1,
      totalFare: 150.00,
      status: "BOOKED",
    },
  });

  console.log("✅ 7 Bookings created (mixed statuses)");

  // ─── Payments ────────────────────────────────────────────────────
  await prisma.payment.create({
    data: {
      bookingId: booking3.id,
      method: "WALLET",
      amount: 60.00,
      status: "SUCCESS",
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking4.id,
      method: "UPI",
      amount: 120.00,
      status: "SUCCESS",
      gatewayRefId: "pay_test_upi_001",
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      method: "CARD",
      amount: 80.00,
      status: "PENDING",
      gatewayRefId: "order_test_card_002",
    },
  });

  console.log("✅ 3 Payments created");

  // ─── Wallet Transactions (recharges so balances aren't zero) ───
  const walletUsers = [
    { user: emp1, balance: 500.00 },
    { user: emp2, balance: 350.00 },
    { user: emp4, balance: 750.00 },
    { user: emp5, balance: 600.00 },
    { user: emp6, balance: 450.00 },
    { user: emp7, balance: 300.00 },
  ];

  for (const { user, balance } of walletUsers) {
    await prisma.walletTransaction.create({
      data: {
        userId: user.id,
        type: "RECHARGE",
        amount: balance,
        balanceAfter: balance,
      },
    });
  }

  // Add a RIDE_PAYMENT txn for the completed booking3
  await prisma.walletTransaction.create({
    data: {
      userId: emp3.id,
      type: "RIDE_PAYMENT",
      amount: 60.00,
      balanceAfter: 140.00,
    },
  });

  console.log("✅ 7 WalletTransactions created (6 recharges + 1 ride payment)");

  // ─── Summary ─────────────────────────────────────────────────────
  console.log("\n🎉 Seed complete! Summary:");
  console.log("   Organizations: 2");
  console.log("   Users: 10 (2 admins + 8 employees)");
  console.log("   Vehicles: 5");
  console.log("   Rides: 6");
  console.log("   Bookings: 7");
  console.log("   Payments: 3");
  console.log("   WalletTransactions: 7");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
