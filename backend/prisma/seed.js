require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcrypt");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding Commuto database with updated userbase and bcrypt passwords...\n");

  // Clean existing data for clean seed execution
  await prisma.auditLog.deleteMany({});
  await prisma.chatMessage.deleteMany({});
  await prisma.walletTransaction.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.rideLocation.deleteMany({});
  await prisma.ride.deleteMany({});
  await prisma.savedPlace.deleteMany({});
  await prisma.vehicle.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});

  // Hash password for all users: 'pass1234'
  const defaultHash = await bcrypt.hash("pass1234", 10);

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

  const org3 = await prisma.organization.create({
    data: {
      name: "TCS (Tata Consultancy Services)",
      fuelCostPerL: 102.00,
      costPerKm: 7.80,
    },
  });

  console.log("✅ 3 Organizations created (Infosys, Wipro, TCS)");

  // ─── Users ───────────────────────────────────────────────────────
  // 1. Super Admin (Developer)
  const superAdmin = await prisma.user.create({
    data: {
      organizationId: null,
      name: "Super Admin",
      email: "superadmin@gmail.com",
      passwordHash: defaultHash,
      role: "SUPER_ADMIN",
      walletBalance: 10000.00,
    },
  });

  // 2. Company Admins
  const adminInfosys = await prisma.user.create({
    data: {
      organizationId: org1.id,
      name: "Arjun Mehta",
      email: "admin@infosys.com",
      passwordHash: defaultHash,
      role: "COMPANY_ADMIN",
      walletBalance: 1000.00,
    },
  });

  const adminWipro = await prisma.user.create({
    data: {
      organizationId: org2.id,
      name: "Priya Sharma",
      email: "admin@wipro.com",
      passwordHash: defaultHash,
      role: "COMPANY_ADMIN",
      walletBalance: 1000.00,
    },
  });

  const adminTcs = await prisma.user.create({
    data: {
      organizationId: org3.id,
      name: "Rajesh Kumar",
      email: "admin@tcs.com",
      passwordHash: defaultHash,
      role: "COMPANY_ADMIN",
      walletBalance: 1000.00,
    },
  });

  // 3. Employees (Specific Requested Accounts)
  const neha = await prisma.user.create({
    data: {
      organizationId: org1.id,
      name: "Neha Sharma",
      email: "neha@infosys.com",
      passwordHash: defaultHash,
      role: "EMPLOYEE",
      walletBalance: 500.00,
    },
  });

  const suraj = await prisma.user.create({
    data: {
      organizationId: org3.id,
      name: "Suraj Verma",
      email: "suraj@tcs.com",
      passwordHash: defaultHash,
      role: "EMPLOYEE",
      walletBalance: 600.00,
    },
  });

  const amit = await prisma.user.create({
    data: {
      organizationId: org2.id,
      name: "Amit Patel",
      email: "amit@wipro.com",
      passwordHash: defaultHash,
      role: "EMPLOYEE",
      walletBalance: 450.00,
    },
  });

  // Additional Employees
  const rahul = await prisma.user.create({
    data: {
      organizationId: org1.id,
      name: "Rahul Nair",
      email: "rahul.nair@infosys.com",
      passwordHash: defaultHash,
      role: "EMPLOYEE",
      walletBalance: 350.00,
    },
  });

  const sneha = await prisma.user.create({
    data: {
      organizationId: org1.id,
      name: "Sneha Reddy",
      email: "sneha.reddy@infosys.com",
      passwordHash: defaultHash,
      role: "EMPLOYEE",
      walletBalance: 400.00,
    },
  });

  const karthik = await prisma.user.create({
    data: {
      organizationId: org2.id,
      name: "Karthik Iyer",
      email: "karthik.iyer@wipro.com",
      passwordHash: defaultHash,
      role: "EMPLOYEE",
      walletBalance: 300.00,
    },
  });

  console.log("✅ 1 Super Admin + 3 Company Admins + 6 Employees created (Password: pass1234)");

  // ─── Vehicles ────────────────────────────────────────────────────
  const v1 = await prisma.vehicle.create({
    data: {
      driverId: neha.id,
      model: "Maruti Suzuki Swift",
      registrationNo: "KA-01-AB-1234",
      seatingCap: 4,
      fuelEfficiencyKmpl: 22.0,
    },
  });

  const v2 = await prisma.vehicle.create({
    data: {
      driverId: suraj.id,
      model: "Hyundai Creta",
      registrationNo: "KA-01-CD-5678",
      seatingCap: 5,
      fuelEfficiencyKmpl: 16.5,
    },
  });

  const v3 = await prisma.vehicle.create({
    data: {
      driverId: amit.id,
      model: "Honda City",
      registrationNo: "KA-02-EF-9012",
      seatingCap: 4,
      fuelEfficiencyKmpl: 18.0,
    },
  });

  const v4 = await prisma.vehicle.create({
    data: {
      driverId: rahul.id,
      model: "Tata Nexon EV",
      registrationNo: "KA-01-EV-7890",
      seatingCap: 4,
      fuelEfficiencyKmpl: null,
    },
  });

  console.log("✅ 4 Vehicles created");

  // ─── Rides ───────────────────────────────────────────────────────
  const now = new Date();
  const hourMs = 60 * 60 * 1000;

  const ride1 = await prisma.ride.create({
    data: {
      driverId: neha.id,
      vehicleId: v1.id,
      pickupLoc: "Koramangala, Bangalore",
      pickupLat: 12.9352,
      pickupLng: 77.6245,
      destination: "Electronic City (Infosys), Bangalore",
      destLat: 12.8399,
      destLng: 77.6770,
      departureTime: new Date(now.getTime() + 2 * hourMs),
      availableSeats: 3,
      farePerSeat: 80.00,
      distanceKm: 16.5,
      status: "PUBLISHED",
    },
  });

  const ride2 = await prisma.ride.create({
    data: {
      driverId: suraj.id,
      vehicleId: v2.id,
      pickupLoc: "Whitefield, Bangalore",
      pickupLat: 12.9698,
      pickupLng: 77.7500,
      destination: "TCS Campus, Electronic City",
      destLat: 12.8450,
      destLng: 77.6620,
      departureTime: new Date(now.getTime() + 4 * hourMs),
      availableSeats: 4,
      farePerSeat: 120.00,
      distanceKm: 22.0,
      status: "PUBLISHED",
    },
  });

  const ride3 = await prisma.ride.create({
    data: {
      driverId: amit.id,
      vehicleId: v3.id,
      pickupLoc: "Indiranagar, Bangalore",
      pickupLat: 12.9784,
      pickupLng: 77.6408,
      destination: "Wipro Sarjapur Campus, Bangalore",
      destLat: 12.9100,
      destLng: 77.6850,
      departureTime: new Date(now.getTime() - 2 * hourMs),
      availableSeats: 0,
      farePerSeat: 70.00,
      distanceKm: 12.0,
      status: "COMPLETED",
    },
  });

  console.log("✅ 3 Rides created");

  // ─── Bookings ────────────────────────────────────────────────────
  const booking1 = await prisma.booking.create({
    data: {
      rideId: ride1.id,
      passengerId: sneha.id,
      seatsBooked: 1,
      totalFare: 80.00,
      status: "BOOKED",
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      rideId: ride2.id,
      passengerId: karthik.id,
      seatsBooked: 2,
      totalFare: 240.00,
      status: "PAYMENT_PENDING",
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      rideId: ride3.id,
      passengerId: neha.id,
      seatsBooked: 1,
      totalFare: 70.00,
      status: "PAYMENT_COMPLETED",
    },
  });

  console.log("✅ 3 Bookings created");

  // ─── Payments ────────────────────────────────────────────────────
  await prisma.payment.create({
    data: {
      bookingId: booking3.id,
      method: "WALLET",
      amount: 70.00,
      status: "SUCCESS",
      gatewayRefId: "pay_wallet_001",
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      method: "UPI",
      amount: 80.00,
      status: "PENDING",
      gatewayRefId: "pay_upi_002",
    },
  });

  console.log("✅ 2 Payments created");

  // ─── Wallet Transactions ─────────────────────────────────────────
  const usersForWallet = [neha, suraj, amit, rahul, sneha, karthik];
  for (const u of usersForWallet) {
    await prisma.walletTransaction.create({
      data: {
        userId: u.id,
        type: "RECHARGE",
        amount: Number(u.walletBalance),
        balanceAfter: Number(u.walletBalance),
      },
    });
  }

  await prisma.walletTransaction.create({
    data: {
      userId: neha.id,
      type: "RIDE_PAYMENT",
      amount: 70.00,
      balanceAfter: 430.00,
    },
  });

  console.log("✅ Wallet Transactions created");
  console.log("\n🎉 Seed completed successfully!");
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
