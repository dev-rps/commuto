require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcrypt");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

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

async function main() {
  console.log("Seeding Commuto database with 200+ records per table...");

  console.log("Cleaning existing data...");
  await prisma.$executeRawUnsafe(`
    TRUNCATE "Organization", "User", "Vehicle", "SavedPlace", "Ride", "RideLocation", "Booking", "Payment", "WalletTransaction", "ChatMessage", "AuditLog", "TrustedContact", "SosAlert", "Review", "RecurringRide" CASCADE;
  `);
  console.log("Clean done.");

  const defaultHash = await bcrypt.hash("pass1234", 10);

  // 1. ORGANIZATIONS
  const ORG_SPECS = [
    { name: "TechCorp Solutions", fuel: 96.50, km: 8.00 },
    { name: "InnovateInc", fuel: 95.00, km: 7.50 },
    { name: "Apex Global", fuel: 98.00, km: 9.00 },
    { name: "CyberPulse", fuel: 94.00, km: 7.00 },
    { name: "NexGen Systems", fuel: 97.00, km: 8.50 },
    { name: "CloudMatrix", fuel: 95.50, km: 7.80 },
    { name: "DataStream Tech", fuel: 96.00, km: 8.20 },
    { name: "Quantum Labs", fuel: 99.00, km: 9.50 },
    { name: "EcoDrive Enterprise", fuel: 93.50, km: 6.50 },
    { name: "OmniSoft India", fuel: 97.50, km: 8.70 },
  ];
  const orgs = [];
  const orgSlugs = [];
  for (const spec of ORG_SPECS) {
    const org = await prisma.organization.create({
      data: {
        name: spec.name,
        fuelCostPerL: spec.fuel,
        costPerKm: spec.km,
      },
    });
    orgs.push(org);
    orgSlugs.push(spec.name.toLowerCase().replace(/[^a-z0-9]/g, ""));
  }
  console.log(`${orgs.length} Organizations created`);

  // 2. USERS
  const allUsers = [];

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

  const companyAdmins = [];
  for (let i = 0; i < orgs.length; i++) {
    const org = orgs[i];
    const slug = orgSlugs[i];
    const admin = await prisma.user.create({
      data: {
        organizationId: org.id,
        name: `${org.name} Admin`,
        email: `admin${i + 1}@${slug}.com`,
        passwordHash: defaultHash,
        role: "COMPANY_ADMIN",
        walletBalance: 5000.00,
      },
    });
    companyAdmins.push(admin);
    allUsers.push(admin);
  }

  const employees = [];
  const usedEmails = new Set(allUsers.map(u => u.email));
  let empCount = 0;
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
  console.log(`${allUsers.length} Users created`);

  // 3. VEHICLES
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
  console.log(`${vehicles.length} Vehicles created`);

  // 4. SAVED PLACES
  const savedPlaceItems = [];
  for (const emp of employees) {
    const numPlaces = randomInt(1, 4);
    const usedPlaceNames = new Set();
    for (let p = 0; p < numPlaces; p++) {
      let placeName;
      do { placeName = pick(SAVED_PLACE_NAMES); } while (usedPlaceNames.has(placeName));
      usedPlaceNames.add(placeName);
      const area = pick(BANGALORE_AREAS);
      savedPlaceItems.push({
        userId: emp.id,
        name: placeName,
        latitude: area.lat + randomBetween(-0.01, 0.01),
        longitude: area.lng + randomBetween(-0.01, 0.01),
      });
    }
  }
  await prisma.savedPlace.createMany({ data: savedPlaceItems });
  console.log(`${savedPlaceItems.length} Saved Places created`);

  // 5. RIDES
  const rides = [];
  for (let i = 0; i < 200; i++) {
    const vInfo = pick(vehicles);
    const driver = vInfo.driver;
    const vehicle = vInfo.vehicle;
    const seatingCap = vInfo.seatingCap;

    const pickupArea = pick(BANGALORE_AREAS);
    const destArea = pick([...BANGALORE_AREAS, ...OFFICE_LOCATIONS]);
    const statusOptions = ["PUBLISHED","PUBLISHED","PUBLISHED","AT_PICKUP","IN_PROGRESS","COMPLETED","COMPLETED","CANCELLED"];
    const status = pick(statusOptions);

    let departureTime;
    let availableSeats;
    if (status === "PUBLISHED") {
      departureTime = futureDate(randomBetween(1, 72));
      availableSeats = randomInt(1, seatingCap - 1);
    } else if (status === "IN_PROGRESS" || status === "AT_PICKUP") {
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
  console.log(`${rides.length} Rides created`);

  // 6. RIDE LOCATIONS
  const activeRides = rides.filter(r => ["COMPLETED","IN_PROGRESS","AT_PICKUP"].includes(r.status));
  const rideLocationItems = [];
  for (const rInfo of activeRides) {
    const numPings = randomInt(3, 8);
    const baseArea = pick(BANGALORE_AREAS);
    let lat = baseArea.lat;
    let lng = baseArea.lng;
    for (let ping = 0; ping < numPings; ping++) {
      lat += randomBetween(-0.003, 0.003);
      lng += randomBetween(-0.003, 0.003);
      const ts = new Date(rInfo.ride.departureTime.getTime() + ping * 5 * 60 * 1000);
      rideLocationItems.push({
        rideId: rInfo.ride.id,
        latitude: lat,
        longitude: lng,
        timestamp: ts,
      });
    }
  }
  await prisma.rideLocation.createMany({ data: rideLocationItems });
  console.log(`${rideLocationItems.length} Ride Locations created`);

  // 7. BOOKINGS
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

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const booking = await prisma.booking.create({
      data: {
        rideId: rInfo.ride.id,
        passengerId: passenger.id,
        seatsBooked,
        totalFare,
        status: bStatus,
        otp,
      },
    });
    bookings.push({ booking, totalFare, bStatus });
    bookingCount++;
  }
  console.log(`${bookings.length} Bookings created`);

  // 8. PAYMENTS
  const paymentItems = [];
  let payIdx = 1;
  for (const { booking, totalFare, bStatus } of bookings) {
    let pStatus;
    if (bStatus === "PAYMENT_COMPLETED") pStatus = "SUCCESS";
    else if (bStatus === "CANCELLED") pStatus = "FAILED";
    else pStatus = pick(["PENDING","SUCCESS","FAILED"]);

    const method = pick(PAYMENT_METHODS);
    const refId = `pay_${method.toLowerCase()}_${String(payIdx++).padStart(5, "0")}`;

    paymentItems.push({
      bookingId: booking.id,
      method,
      amount: totalFare,
      status: pStatus,
      gatewayRefId: refId,
    });
  }
  await prisma.payment.createMany({ data: paymentItems });
  console.log(`${paymentItems.length} Payments created`);

  // 9. WALLET TRANSACTIONS
  const walletItems = [];
  for (const user of [...employees, ...companyAdmins]) {
    const rechargeAmt = parseFloat(randomBetween(200, 2000).toFixed(2));
    walletItems.push({
      userId: user.id,
      type: "RECHARGE",
      amount: rechargeAmt,
      balanceAfter: rechargeAmt,
    });
  }
  while (walletItems.length < 200) {
    const user = pick([...employees, ...companyAdmins]);
    const type = pick(WALLET_TXN_TYPES);
    const amount = parseFloat(randomBetween(50, 500).toFixed(2));
    const balanceAfter = parseFloat(randomBetween(50, 1500).toFixed(2));
    walletItems.push({
      userId: user.id,
      type,
      amount,
      balanceAfter,
    });
  }
  await prisma.walletTransaction.createMany({ data: walletItems });
  console.log(`${walletItems.length} Wallet Transactions created`);

  // 10. CHAT MESSAGES
  const chatItems = [];
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
      chatItems.push({
        rideId: rInfo.ride.id,
        senderId: sender.id,
        message: pick(CHAT_MESSAGES),
        sentAt,
      });
    }
  }
  await prisma.chatMessage.createMany({ data: chatItems });
  console.log(`${chatItems.length} Chat Messages created`);

  // 11. AUDIT LOGS
  const auditItems = [];
  const auditUsers = [...employees, ...companyAdmins, superAdmin];
  for (let i = 0; i < 200; i++) {
    const user = pick(auditUsers);
    const action = pick(AUDIT_ACTIONS);
    const timestamp = pastDate(randomInt(0, 90));
    auditItems.push({
      userId: user.id,
      action,
      timestamp,
    });
  }
  await prisma.auditLog.createMany({ data: auditItems });
  console.log(`${auditItems.length} Audit Logs created`);

  console.log("===============================================");
  console.log("Seed completed successfully!");
  console.log("===============================================");
  console.log(`  Organizations  : ${orgs.length}`);
  console.log(`  Users          : ${allUsers.length}`);
  console.log(`  Vehicles       : ${vehicles.length}`);
  console.log(`  Saved Places   : ${savedPlaceItems.length}`);
  console.log(`  Rides          : ${rides.length}`);
  console.log(`  Ride Locations : ${rideLocationItems.length}`);
  console.log(`  Bookings       : ${bookings.length}`);
  console.log(`  Payments       : ${paymentItems.length}`);
  console.log(`  Wallet Txns    : ${walletItems.length}`);
  console.log(`  Chat Messages  : ${chatItems.length}`);
  console.log(`  Audit Logs     : ${auditItems.length}`);
  console.log("===============================================");
  console.log("  All passwords : pass1234");
  console.log("  Super Admin  : superadmin@gmail.com");
  console.log("===============================================");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
