require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcrypt");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ─── Helpers ─────────────────────────────────────────────────────────────────

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}
function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}
function pick(arr) {
  return arr[randomInt(0, arr.length - 1)];
}
function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
function pastDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}
function futureDate(hoursAhead) {
  return new Date(Date.now() + hoursAhead * 60 * 60 * 1000);
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  "Aarav","Aditi","Akash","Anika","Arjun","Avni","Deepak","Divya","Gaurav","Geeta",
  "Harish","Heena","Ishaan","Isha","Jatin","Jyoti","Karan","Kavya","Lalit","Lavanya",
  "Manish","Meera","Neeraj","Neha","Omkar","Pooja","Pradeep","Priya","Rahul","Riya",
  "Rohit","Roshni","Sachin","Sandhya","Sanjay","Sanjna","Shivam","Shreya","Siddharth","Simran",
  "Sneha","Srinivas","Suresh","Sunil","Tarun","Tejal","Uday","Uma","Varun","Vikram",
  "Vishal","Vrinda","Yash","Yogesh","Zara","Aditya","Ananya","Arnav","Bhavna","Chetan",
  "Disha","Esha","Farhan","Gauri","Himanshu","Ira","Jayesh","Kajal","Lokesh","Madhuri",
  "Nalini","Nikhil","Ojas","Pankaj","Rajan","Rekha","Sameer","Tanvi","Ujjwal","Vandana"
];
const LAST_NAMES = [
  "Sharma","Mehta","Patel","Kumar","Verma","Nair","Iyer","Reddy","Singh","Joshi",
  "Rao","Gupta","Agarwal","Chaudhary","Mishra","Tiwari","Pandey","Trivedi","Shah","Desai",
  "Bose","Menon","Pillai","Krishnan","Naidu","Rajan","Venkatesan","Subramaniam","Balakrishnan","Srinivasan",
  "Chatterjee","Banerjee","Das","Ghosh","Dutta","Roy","Biswas","Sen","Mukherjee","Chakraborty"
];
const BANGALORE_AREAS = [
  { name: "Koramangala", lat: 12.9352, lng: 77.6245 },
  { name: "Whitefield", lat: 12.9698, lng: 77.7500 },
  { name: "Indiranagar", lat: 12.9784, lng: 77.6408 },
  { name: "Electronic City", lat: 12.8399, lng: 77.6770 },
  { name: "Marathahalli", lat: 12.9591, lng: 77.6971 },
  { name: "HSR Layout", lat: 12.9116, lng: 77.6474 },
  { name: "BTM Layout", lat: 12.9166, lng: 77.6101 },
  { name: "Jayanagar", lat: 12.9299, lng: 77.5848 },
  { name: "JP Nagar", lat: 12.9063, lng: 77.5857 },
  { name: "Bannerghatta Road", lat: 12.8875, lng: 77.5975 },
  { name: "Bellandur", lat: 12.9263, lng: 77.6727 },
  { name: "Sarjapur Road", lat: 12.9053, lng: 77.6869 },
  { name: "Hebbal", lat: 13.0350, lng: 77.5970 },
  { name: "Yelahanka", lat: 13.1007, lng: 77.5963 },
  { name: "Tumkur Road", lat: 13.0600, lng: 77.5200 },
  { name: "Magadi Road", lat: 12.9800, lng: 77.5300 },
  { name: "Banashankari", lat: 12.9250, lng: 77.5500 },
  { name: "Rajajinagar", lat: 12.9940, lng: 77.5550 },
  { name: "Malleshwaram", lat: 13.0035, lng: 77.5650 },
  { name: "Yeshwanthpur", lat: 13.0290, lng: 77.5530 },
];
const OFFICE_LOCATIONS = [
  { name: "Infosys Campus, Electronic City", lat: 12.8450, lng: 77.6620 },
  { name: "Wipro Sarjapur Campus", lat: 12.9100, lng: 77.6850 },
  { name: "TCS Whitefield Campus", lat: 12.9700, lng: 77.7490 },
  { name: "Manyata Tech Park, Hebbal", lat: 13.0450, lng: 77.6000 },
  { name: "Bagmane Tech Park, CV Raman Nagar", lat: 12.9930, lng: 77.6450 },
];
const VEHICLE_MODELS = [
  { model: "Maruti Suzuki Swift", efficiency: 22.0, seats: 4 },
  { model: "Hyundai Creta", efficiency: 16.5, seats: 5 },
  { model: "Honda City", efficiency: 18.0, seats: 4 },
  { model: "Tata Nexon EV", efficiency: null, seats: 4 },
  { model: "Kia Seltos", efficiency: 17.0, seats: 5 },
  { model: "Toyota Innova Crysta", efficiency: 14.0, seats: 7 },
  { model: "Maruti Suzuki Ertiga", efficiency: 20.0, seats: 6 },
  { model: "Hyundai Venue", efficiency: 18.5, seats: 5 },
  { model: "Tata Altroz", efficiency: 19.0, seats: 5 },
  { model: "Renault Triber", efficiency: 18.0, seats: 7 },
  { model: "Maruti Suzuki Baleno", efficiency: 22.35, seats: 5 },
  { model: "Honda Amaze", efficiency: 18.6, seats: 5 },
  { model: "Toyota Glanza", efficiency: 22.0, seats: 5 },
  { model: "Volkswagen Virtus", efficiency: 19.89, seats: 5 },
  { model: "Skoda Slavia", efficiency: 21.0, seats: 5 },
];
const SAVED_PLACE_NAMES = [
  "Home","Office","Gym","Mom's House","Parent's Home","Friend's Place",
  "Airport","Railway Station","Mall","Hospital","School","College",
  "Library","Temple","Coffee Shop","Restaurant","Park","Pharmacy","Market","Bank",
];
const CHAT_MESSAGES = [
  "I'm on my way, be there in 5 mins!",
  "Can you wait 2 minutes at the pickup point?",
  "Traffic is a bit heavy near the signal.",
  "I've reached the pickup location.",
  "What's your exact location?",
  "Running 10 minutes late, apologies!",
  "Can you share your live location?",
  "We'll take the flyover route to avoid traffic.",
  "Parking here for a moment, come down.",
  "Please be at the gate by 8:30 AM.",
  "Ride confirmed, see you then!",
  "ETA is about 15 minutes now.",
  "Good morning! Ready for the ride?",
  "I've started the journey.",
  "Thanks for the ride, had a great time!",
  "Can we stop at a petrol pump on the way?",
  "Almost there, just 2 kms away.",
  "Please confirm your seat booking.",
  "The car is a white Swift, KA-01 plates.",
  "See you at the usual spot!",
];
const AUDIT_ACTIONS = [
  "USER_LOGIN","USER_LOGOUT","RIDE_CREATED","RIDE_CANCELLED","RIDE_COMPLETED",
  "BOOKING_CREATED","BOOKING_CANCELLED","PAYMENT_INITIATED","PAYMENT_COMPLETED","WALLET_RECHARGE",
  "VEHICLE_ADDED","VEHICLE_UPDATED","PROFILE_UPDATED","SAVED_PLACE_ADDED","PASSWORD_CHANGED",
  "ADMIN_USER_CREATED","ADMIN_USER_SUSPENDED","REPORT_GENERATED","SEAT_BOOKING_CONFIRMED","REFUND_PROCESSED",
];
const PAYMENT_METHODS = ["CASH", "CARD", "UPI", "WALLET"];
const WALLET_TXN_TYPES = ["RECHARGE", "RIDE_PAYMENT", "REFUND"];

// ─── Main Seed ────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding Commuto database with 200+ records per table...\n");

  // ── Clean existing data (order matters due to FK constraints) ──────────────
  console.log("🧹 Cleaning existing data...");
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
  console.log("✅ Clean done.\n");

  // ─── Hash password ─────────────────────────────────────────────────────────
  const defaultHash = await bcrypt.hash("pass1234", 10);

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. ORGANIZATIONS (10 companies)
  // ═══════════════════════════════════════════════════════════════════════════
  const orgData = [
    { name: "Infosys Ltd", fuelCostPerL: 104.50, costPerKm: 8.00 },
    { name: "Wipro Technologies", fuelCostPerL: 101.25, costPerKm: 7.50 },
    { name: "TCS (Tata Consultancy Services)", fuelCostPerL: 102.00, costPerKm: 7.80 },
    { name: "HCL Technologies", fuelCostPerL: 100.00, costPerKm: 7.20 },
    { name: "Tech Mahindra", fuelCostPerL: 103.00, costPerKm: 7.90 },
    { name: "Accenture India", fuelCostPerL: 105.00, costPerKm: 8.50 },
    { name: "IBM India", fuelCostPerL: 99.50, costPerKm: 7.00 },
    { name: "Capgemini India", fuelCostPerL: 101.75, costPerKm: 7.60 },
    { name: "Cognizant Technology", fuelCostPerL: 100.50, costPerKm: 7.40 },
    { name: "Oracle India", fuelCostPerL: 106.00, costPerKm: 8.20 },
  ];
  const orgs = [];
  for (const od of orgData) {
    const org = await prisma.organization.create({ data: od });
    orgs.push(org);
  }
  console.log(`✅ ${orgs.length} Organizations created`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. USERS – 100 employees + 1 super admin + 10 company admins
  // ═══════════════════════════════════════════════════════════════════════════
  const allUsers = [];

  // Super Admin
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
  allUsers.push(superAdmin);

  // Company Admins (1 per org)
  const companyAdmins = [];
  const adminNames = [
    ["Arjun Mehta", "admin@infosys.com"],
    ["Priya Sharma", "admin@wipro.com"],
    ["Rajesh Kumar", "admin@tcs.com"],
    ["Sunita Rao", "admin@hcl.com"],
    ["Mahesh Naidu", "admin@techmahindra.com"],
    ["Deepa Krishnan", "admin@accenture.com"],
    ["Suresh Pillai", "admin@ibm.com"],
    ["Anjali Desai", "admin@capgemini.com"],
    ["Ramesh Iyer", "admin@cognizant.com"],
    ["Kavitha Nair", "admin@oracle.com"],
  ];
  for (let i = 0; i < orgs.length; i++) {
    const admin = await prisma.user.create({
      data: {
        organizationId: orgs[i].id,
        name: adminNames[i][0],
        email: adminNames[i][1],
        passwordHash: defaultHash,
        role: "COMPANY_ADMIN",
        walletBalance: parseFloat(randomBetween(800, 2000).toFixed(2)),
      },
    });
    companyAdmins.push(admin);
    allUsers.push(admin);
  }

  // 100 Employees
  const employees = [];
  const usedEmails = new Set();
  // Pre-seed specific named employees
  const specificEmployees = [
    { organizationId: orgs[0].id, name: "Neha Sharma", email: "neha@infosys.com", walletBalance: 500.00 },
    { organizationId: orgs[2].id, name: "Suraj Verma", email: "suraj@tcs.com", walletBalance: 600.00 },
    { organizationId: orgs[1].id, name: "Amit Patel", email: "amit@wipro.com", walletBalance: 450.00 },
    { organizationId: orgs[0].id, name: "Rahul Nair", email: "rahul.nair@infosys.com", walletBalance: 350.00 },
    { organizationId: orgs[0].id, name: "Sneha Reddy", email: "sneha.reddy@infosys.com", walletBalance: 400.00 },
    { organizationId: orgs[1].id, name: "Karthik Iyer", email: "karthik.iyer@wipro.com", walletBalance: 300.00 },
  ];
  for (const se of specificEmployees) {
    usedEmails.add(se.email);
    const emp = await prisma.user.create({
      data: { ...se, passwordHash: defaultHash, role: "EMPLOYEE" },
    });
    employees.push(emp);
    allUsers.push(emp);
  }

  // Remaining random employees to reach 100
  const orgSlugs = ["infosys","wipro","tcs","hcl","techmahindra","accenture","ibm","capgemini","cognizant","oracle"];
  let empCount = specificEmployees.length;
  let attempt = 0;
  while (empCount < 100 && attempt < 5000) {
    attempt++;
    const orgIdx = randomInt(0, orgs.length - 1);
    const org = orgs[orgIdx];
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${empCount}@${orgSlugs[orgIdx]}.com`;
    if (usedEmails.has(email)) continue;
    usedEmails.add(email);
    const emp = await prisma.user.create({
      data: {
        organizationId: org.id,
        name: `${firstName} ${lastName}`,
        email,
        passwordHash: defaultHash,
        role: "EMPLOYEE",
        walletBalance: parseFloat(randomBetween(100, 1500).toFixed(2)),
      },
    });
    employees.push(emp);
    allUsers.push(emp);
    empCount++;
  }
  console.log(`✅ ${allUsers.length} Users created (1 super admin + ${companyAdmins.length} admins + ${employees.length} employees)`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. VEHICLES – 100 vehicles (one per driver employee)
  // ═══════════════════════════════════════════════════════════════════════════
  const vehicles = [];
  const vehicleOwners = pickN(employees, 100);
  const regNos = new Set();

  for (let i = 0; i < vehicleOwners.length; i++) {
    const owner = vehicleOwners[i];
    const spec = pick(VEHICLE_MODELS);
    let reg;
    do {
      const distNum = randomInt(1, 99).toString().padStart(2, "0");
      const letters = String.fromCharCode(65 + randomInt(0, 25)) + String.fromCharCode(65 + randomInt(0, 25));
      const num = randomInt(1000, 9999);
      reg = `KA-${distNum}-${letters}-${num}`;
    } while (regNos.has(reg));
    regNos.add(reg);

    const v = await prisma.vehicle.create({
      data: {
        driverId: owner.id,
        model: spec.model,
        registrationNo: reg,
        seatingCap: spec.seats,
        fuelEfficiencyKmpl: spec.efficiency,
        isActive: Math.random() > 0.1,
      },
    });
    vehicles.push({ vehicle: v, driver: owner, seatingCap: spec.seats });
  }
  console.log(`✅ ${vehicles.length} Vehicles created`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. SAVED PLACES – ~200 records (avg 2 per employee)
  // ═══════════════════════════════════════════════════════════════════════════
  const savedPlacePromises = [];
  for (const emp of employees) {
    const numPlaces = randomInt(1, 4);
    const usedPlaceNames = new Set();
    for (let p = 0; p < numPlaces; p++) {
      let placeName;
      do { placeName = pick(SAVED_PLACE_NAMES); } while (usedPlaceNames.has(placeName));
      usedPlaceNames.add(placeName);
      const area = pick(BANGALORE_AREAS);
      savedPlacePromises.push(
        prisma.savedPlace.create({
          data: {
            userId: emp.id,
            name: placeName,
            latitude: area.lat + randomBetween(-0.01, 0.01),
            longitude: area.lng + randomBetween(-0.01, 0.01),
          },
        })
      );
    }
  }
  const savedPlaces = await Promise.all(savedPlacePromises);
  console.log(`✅ ${savedPlaces.length} Saved Places created`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. RIDES – 200 rides
  // ═══════════════════════════════════════════════════════════════════════════
  const rides = [];
  for (let i = 0; i < 200; i++) {
    const vInfo = pick(vehicles);
    const driver = vInfo.driver;
    const vehicle = vInfo.vehicle;
    const seatingCap = vInfo.seatingCap;

    const pickupArea = pick(BANGALORE_AREAS);
    const destArea = pick([...BANGALORE_AREAS, ...OFFICE_LOCATIONS]);
    const statusOptions = ["PUBLISHED","PUBLISHED","PUBLISHED","IN_PROGRESS","COMPLETED","COMPLETED","CANCELLED"];
    const status = pick(statusOptions);

    let departureTime;
    let availableSeats;
    if (status === "PUBLISHED") {
      departureTime = futureDate(randomBetween(1, 72));
      availableSeats = randomInt(1, seatingCap - 1);
    } else if (status === "IN_PROGRESS") {
      departureTime = new Date(Date.now() - randomBetween(0, 30) * 60 * 1000);
      availableSeats = randomInt(0, seatingCap - 1);
    } else if (status === "COMPLETED") {
      departureTime = pastDate(randomInt(1, 60));
      availableSeats = 0;
    } else {
      departureTime = pastDate(randomInt(1, 30));
      availableSeats = randomInt(0, seatingCap - 1);
    }

    const distanceKm = parseFloat(randomBetween(5, 45).toFixed(1));
    const farePerSeat = parseFloat(randomBetween(40, 200).toFixed(2));

    const ride = await prisma.ride.create({
      data: {
        driverId: driver.id,
        vehicleId: vehicle.id,
        pickupLoc: pickupArea.name + ", Bangalore",
        pickupLat: pickupArea.lat + randomBetween(-0.005, 0.005),
        pickupLng: pickupArea.lng + randomBetween(-0.005, 0.005),
        destination: destArea.name + (destArea.name.includes("Bangalore") ? "" : ", Bangalore"),
        destLat: destArea.lat + randomBetween(-0.005, 0.005),
        destLng: destArea.lng + randomBetween(-0.005, 0.005),
        departureTime,
        availableSeats,
        farePerSeat,
        distanceKm,
        status,
      },
    });
    rides.push({ ride, farePerSeat, seatingCap, status });
  }
  console.log(`✅ ${rides.length} Rides created`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. RIDE LOCATIONS – 200+ location pings (for completed/in-progress rides)
  // ═══════════════════════════════════════════════════════════════════════════
  const activeRides = rides.filter(r => ["COMPLETED","IN_PROGRESS"].includes(r.status));
  const rideLocationPromises = [];
  for (const rInfo of activeRides) {
    const numPings = randomInt(3, 8);
    const baseArea = pick(BANGALORE_AREAS);
    let lat = baseArea.lat;
    let lng = baseArea.lng;
    for (let ping = 0; ping < numPings; ping++) {
      lat += randomBetween(-0.003, 0.003);
      lng += randomBetween(-0.003, 0.003);
      const ts = new Date(rInfo.ride.departureTime.getTime() + ping * 5 * 60 * 1000);
      rideLocationPromises.push(
        prisma.rideLocation.create({
          data: {
            rideId: rInfo.ride.id,
            latitude: lat,
            longitude: lng,
            timestamp: ts,
          },
        })
      );
    }
  }
  const rideLocations = await Promise.all(rideLocationPromises);
  console.log(`✅ ${rideLocations.length} Ride Locations created`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. BOOKINGS – 200 bookings
  // ═══════════════════════════════════════════════════════════════════════════
  const bookings = [];
  const ridesForBooking = rides.filter(r => r.status !== "CANCELLED");

  let bookingCount = 0;
  let attempts = 0;
  while (bookingCount < 200 && attempts < 3000) {
    attempts++;
    const rInfo = pick(ridesForBooking);
    const nonDriverEmployees = employees.filter(e => e.id !== rInfo.ride.driverId);
    if (nonDriverEmployees.length === 0) continue;
    const passenger = pick(nonDriverEmployees);
    const seatsBooked = randomInt(1, Math.min(2, rInfo.seatingCap));
    const totalFare = parseFloat((seatsBooked * rInfo.farePerSeat).toFixed(2));

    let bStatus;
    if (rInfo.status === "COMPLETED") {
      bStatus = pick(["PAYMENT_COMPLETED","PAYMENT_COMPLETED","CANCELLED"]);
    } else if (rInfo.status === "IN_PROGRESS") {
      bStatus = pick(["BOOKED","PAYMENT_COMPLETED"]);
    } else {
      bStatus = pick(["BOOKED","PAYMENT_PENDING","CANCELLED"]);
    }

    const booking = await prisma.booking.create({
      data: {
        rideId: rInfo.ride.id,
        passengerId: passenger.id,
        seatsBooked,
        totalFare,
        status: bStatus,
      },
    });
    bookings.push({ booking, totalFare, bStatus });
    bookingCount++;
  }
  console.log(`✅ ${bookings.length} Bookings created`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. PAYMENTS – one per booking (200 payments)
  // ═══════════════════════════════════════════════════════════════════════════
  const paymentPromises = [];
  let payIdx = 1;
  for (const { booking, totalFare, bStatus } of bookings) {
    let pStatus;
    if (bStatus === "PAYMENT_COMPLETED") pStatus = "SUCCESS";
    else if (bStatus === "CANCELLED") pStatus = "FAILED";
    else pStatus = pick(["PENDING","SUCCESS","FAILED"]);

    const method = pick(PAYMENT_METHODS);
    const refId = `pay_${method.toLowerCase()}_${String(payIdx++).padStart(5, "0")}`;

    paymentPromises.push(
      prisma.payment.create({
        data: {
          bookingId: booking.id,
          method,
          amount: totalFare,
          status: pStatus,
          gatewayRefId: refId,
        },
      })
    );
  }
  const payments = await Promise.all(paymentPromises);
  console.log(`✅ ${payments.length} Payments created`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. WALLET TRANSACTIONS – 200+ transactions
  // ═══════════════════════════════════════════════════════════════════════════
  const walletTxnPromises = [];
  // Initial recharge for every employee and admin
  for (const user of [...employees, ...companyAdmins]) {
    const rechargeAmt = parseFloat(randomBetween(200, 2000).toFixed(2));
    walletTxnPromises.push(
      prisma.walletTransaction.create({
        data: {
          userId: user.id,
          type: "RECHARGE",
          amount: rechargeAmt,
          balanceAfter: rechargeAmt,
        },
      })
    );
  }
  // Additional mixed txns until 200
  while (walletTxnPromises.length < 200) {
    const user = pick([...employees, ...companyAdmins]);
    const type = pick(WALLET_TXN_TYPES);
    const amount = parseFloat(randomBetween(50, 500).toFixed(2));
    const balanceAfter = parseFloat(randomBetween(50, 1500).toFixed(2));
    walletTxnPromises.push(
      prisma.walletTransaction.create({
        data: { userId: user.id, type, amount, balanceAfter },
      })
    );
  }
  const walletTxns = await Promise.all(walletTxnPromises);
  console.log(`✅ ${walletTxns.length} Wallet Transactions created`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. CHAT MESSAGES – 200+ messages
  // ═══════════════════════════════════════════════════════════════════════════
  const chatPromises = [];
  const ridesWithChats = pickN(rides, Math.min(60, rides.length));
  for (const rInfo of ridesWithChats) {
    const numMsgs = randomInt(2, 6);
    const driverUser = employees.find(e => e.id === rInfo.ride.driverId) ||
                       companyAdmins.find(a => a.id === rInfo.ride.driverId) ||
                       pick(employees);
    const participants = [driverUser, pick(employees)].filter(Boolean);
    for (let m = 0; m < numMsgs; m++) {
      const sender = pick(participants);
      const sentAt = new Date(rInfo.ride.departureTime.getTime() - randomBetween(5, 120) * 60 * 1000);
      chatPromises.push(
        prisma.chatMessage.create({
          data: {
            rideId: rInfo.ride.id,
            senderId: sender.id,
            message: pick(CHAT_MESSAGES),
            sentAt,
          },
        })
      );
    }
  }
  const chats = await Promise.all(chatPromises);
  console.log(`✅ ${chats.length} Chat Messages created`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 11. AUDIT LOGS – 200 entries
  // ═══════════════════════════════════════════════════════════════════════════
  const auditPromises = [];
  const auditUsers = [...employees, ...companyAdmins, superAdmin];
  for (let i = 0; i < 200; i++) {
    const user = pick(auditUsers);
    const action = pick(AUDIT_ACTIONS);
    const timestamp = pastDate(randomInt(0, 90));
    auditPromises.push(
      prisma.auditLog.create({
        data: { userId: user.id, action, timestamp },
      })
    );
  }
  const auditLogs = await Promise.all(auditPromises);
  console.log(`✅ ${auditLogs.length} Audit Logs created`);

  // ─── Final Summary ─────────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════");
  console.log("🎉 Seed completed successfully!");
  console.log("═══════════════════════════════════════════════");
  console.log(`  Organizations  : ${orgs.length}`);
  console.log(`  Users          : ${allUsers.length} (1 super admin + ${companyAdmins.length} admins + ${employees.length} employees)`);
  console.log(`  Vehicles       : ${vehicles.length}`);
  console.log(`  Saved Places   : ${savedPlaces.length}`);
  console.log(`  Rides          : ${rides.length}`);
  console.log(`  Ride Locations : ${rideLocations.length}`);
  console.log(`  Bookings       : ${bookings.length}`);
  console.log(`  Payments       : ${payments.length}`);
  console.log(`  Wallet Txns    : ${walletTxns.length}`);
  console.log(`  Chat Messages  : ${chats.length}`);
  console.log(`  Audit Logs     : ${auditLogs.length}`);
  console.log("═══════════════════════════════════════════════");
  console.log("  🔑 All passwords : pass1234");
  console.log("  📧 Super Admin  : superadmin@gmail.com");
  console.log("═══════════════════════════════════════════════\n");
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
