// Mock data matching the exact Prisma schema field names from the backend.
// These shapes are the contract the real backend will return.

const now = new Date();
const hourMs = 60 * 60 * 1000;

export const organizations = [
  { id: 'org-infosys-001', name: 'Infosys Ltd', fuelCostPerL: 104.5, costPerKm: 8.0 },
  { id: 'org-wipro-001', name: 'Wipro Technologies', fuelCostPerL: 101.25, costPerKm: 7.5 },
];

export const currentUser = {
  id: 'emp-rahul-001',
  organizationId: 'org-infosys-001',
  name: 'Rahul Nair',
  email: 'rahul.nair@infosys.com',
  role: 'EMPLOYEE',
  walletBalance: 500.0,
  organization: organizations[0],
};

export const adminUser = {
  id: 'admin-arjun-001',
  organizationId: 'org-infosys-001',
  name: 'Arjun Mehta',
  email: 'arjun.mehta@infosys.com',
  role: 'COMPANY_ADMIN',
  walletBalance: 0,
  organization: organizations[0],
};

export const users = {
  'emp-rahul-001': { id: 'emp-rahul-001', organizationId: 'org-infosys-001', name: 'Rahul Nair', email: 'rahul.nair@infosys.com', role: 'EMPLOYEE', walletBalance: 500.0 },
  'emp-sneha-001': { id: 'emp-sneha-001', organizationId: 'org-infosys-001', name: 'Sneha Reddy', email: 'sneha.reddy@infosys.com', role: 'EMPLOYEE', walletBalance: 350.0 },
  'emp-vikram-001': { id: 'emp-vikram-001', organizationId: 'org-infosys-001', name: 'Vikram Joshi', email: 'vikram.joshi@infosys.com', role: 'EMPLOYEE', walletBalance: 200.0 },
  'emp-ananya-001': { id: 'emp-ananya-001', organizationId: 'org-infosys-001', name: 'Ananya Gupta', email: 'ananya.gupta@infosys.com', role: 'EMPLOYEE', walletBalance: 750.0 },
};

export const vehicles = [
  { id: 'veh-001', driverId: 'emp-rahul-001', model: 'Maruti Suzuki Swift', registrationNo: 'KA-01-AB-1234', seatingCap: 4, fuelEfficiencyKmpl: 22.0, isActive: true },
  { id: 'veh-002', driverId: 'emp-sneha-001', model: 'Hyundai Creta', registrationNo: 'KA-01-CD-5678', seatingCap: 5, fuelEfficiencyKmpl: 16.5, isActive: true },
  { id: 'veh-005', driverId: 'emp-ananya-001', model: 'Tata Nexon EV', registrationNo: 'KA-01-EV-7890', seatingCap: 4, fuelEfficiencyKmpl: null, isActive: true },
];

export const rides = [
  { id: 'ride-001', driverId: 'emp-rahul-001', vehicleId: 'veh-001', pickupLoc: 'Koramangala, Bangalore', pickupLat: 12.9352, pickupLng: 77.6245, destination: 'Electronic City, Bangalore', destLat: 12.8399, destLng: 77.677, departureTime: new Date(now.getTime() + 2 * hourMs).toISOString(), availableSeats: 3, farePerSeat: 80.0, distanceKm: 16.5, status: 'PUBLISHED' },
  { id: 'ride-002', driverId: 'emp-sneha-001', vehicleId: 'veh-002', pickupLoc: 'Whitefield, Bangalore', pickupLat: 12.9698, pickupLng: 77.75, destination: 'MG Road, Bangalore', destLat: 12.9756, destLng: 77.6065, departureTime: new Date(now.getTime() + 5 * hourMs).toISOString(), availableSeats: 4, farePerSeat: 120.0, distanceKm: 22.0, status: 'PUBLISHED' },
  { id: 'ride-003', driverId: 'emp-ananya-001', vehicleId: 'veh-005', pickupLoc: 'HSR Layout, Bangalore', pickupLat: 12.9116, pickupLng: 77.6389, destination: 'Yelahanka, Bangalore', destLat: 13.1007, destLng: 77.5963, departureTime: new Date(now.getTime() + 24 * hourMs).toISOString(), availableSeats: 3, farePerSeat: 150.0, distanceKm: 28.0, status: 'PUBLISHED' },
  { id: 'ride-004', driverId: 'emp-rahul-001', vehicleId: 'veh-001', pickupLoc: 'Jayanagar, Bangalore', pickupLat: 12.9299, pickupLng: 77.5838, destination: 'Hebbal, Bangalore', destLat: 13.0358, destLng: 77.597, departureTime: new Date(now.getTime() - 1 * hourMs).toISOString(), availableSeats: 0, farePerSeat: 100.0, distanceKm: 14.0, status: 'IN_PROGRESS' },
  { id: 'ride-005', driverId: 'emp-sneha-001', vehicleId: 'veh-002', pickupLoc: 'Indiranagar, Bangalore', pickupLat: 12.9784, pickupLng: 77.6408, destination: 'Marathahalli, Bangalore', destLat: 12.9591, destLng: 77.6974, departureTime: new Date(now.getTime() - 3 * hourMs).toISOString(), availableSeats: 0, farePerSeat: 60.0, distanceKm: 8.5, status: 'COMPLETED' },
  { id: 'ride-006', driverId: 'emp-rahul-001', vehicleId: 'veh-001', pickupLoc: 'BTM Layout, Bangalore', pickupLat: 12.9166, pickupLng: 77.6101, destination: 'Whitefield, Bangalore', destLat: 12.9698, destLng: 77.75, departureTime: new Date(now.getTime() - 24 * hourMs).toISOString(), availableSeats: 1, farePerSeat: 110.0, distanceKm: 20.0, status: 'COMPLETED' },
];

export const bookings = [
  { id: 'book-001', rideId: 'ride-001', passengerId: 'emp-vikram-001', seatsBooked: 1, totalFare: 80.0, status: 'BOOKED' },
  { id: 'book-002', rideId: 'ride-004', passengerId: 'emp-vikram-001', seatsBooked: 1, totalFare: 100.0, status: 'PAYMENT_COMPLETED' },
  { id: 'book-003', rideId: 'ride-005', passengerId: 'emp-rahul-001', seatsBooked: 2, totalFare: 120.0, status: 'PAYMENT_COMPLETED' },
  { id: 'book-004', rideId: 'ride-006', passengerId: 'emp-rahul-001', seatsBooked: 1, totalFare: 110.0, status: 'PAYMENT_COMPLETED' },
  { id: 'book-005', rideId: 'ride-003', passengerId: 'emp-vikram-001', seatsBooked: 1, totalFare: 150.0, status: 'BOOKED' },
];

export const payments = [
  { id: 'pay-001', bookingId: 'book-002', method: 'WALLET', amount: 100.0, status: 'SUCCESS', gatewayRefId: null },
  { id: 'pay-002', bookingId: 'book-003', method: 'UPI', amount: 120.0, status: 'SUCCESS', gatewayRefId: 'pay_test_upi_001' },
  { id: 'pay-003', bookingId: 'book-004', method: 'CASH', amount: 110.0, status: 'SUCCESS', gatewayRefId: null },
];

export const walletTransactions = [
  { id: 'wt-001', userId: 'emp-rahul-001', type: 'RECHARGE', amount: 500.0, balanceAfter: 500.0, createdAt: new Date(now.getTime() - 48 * hourMs).toISOString() },
  { id: 'wt-002', userId: 'emp-rahul-001', type: 'RIDE_PAYMENT', amount: 100.0, balanceAfter: 400.0, createdAt: new Date(now.getTime() - 24 * hourMs).toISOString() },
  { id: 'wt-003', userId: 'emp-rahul-001', type: 'RECHARGE', amount: 200.0, balanceAfter: 600.0, createdAt: new Date(now.getTime() - 12 * hourMs).toISOString() },
  { id: 'wt-004', userId: 'emp-rahul-001', type: 'RIDE_PAYMENT', amount: 110.0, balanceAfter: 490.0, createdAt: new Date(now.getTime() - 6 * hourMs).toISOString() },
];

export const chatMessages = {
  'ride-004': [
    { id: 'msg-001', rideId: 'ride-004', senderId: 'emp-rahul-001', message: 'On my way to the pickup point', sentAt: new Date(now.getTime() - 50 * 60 * 1000).toISOString() },
    { id: 'msg-002', rideId: 'ride-004', senderId: 'emp-vikram-001', message: 'Great, I will be waiting at the gate', sentAt: new Date(now.getTime() - 48 * 60 * 1000).toISOString() },
    { id: 'msg-003', rideId: 'ride-004', senderId: 'emp-rahul-001', message: 'Traffic is a bit heavy, ETA 10 minutes', sentAt: new Date(now.getTime() - 20 * 60 * 1000).toISOString() },
  ],
};

export const savedPlaces = [
  { id: 'place-001', userId: 'emp-rahul-001', name: 'Home', latitude: 12.9352, longitude: 77.6245 },
  { id: 'place-002', userId: 'emp-rahul-001', name: 'Office', latitude: 12.8399, longitude: 77.677 },
];

export const reportSummary = {
  organization: organizations[0],
  summary: {
    totalTrips: 2,
    totalDistance: 28.5,
    totalPassengers: 3,
    totalFuelConsumed: 1.43,
    totalFuelCost: 149.43,
    costPerKm: 8.0,
  },
  vehicleBreakdown: [
    { vehicleId: 'veh-001', model: 'Maruti Suzuki Swift', registrationNo: 'KA-01-AB-1234', fuelEfficiencyKmpl: 22.0, totalTrips: 1, totalDistanceKm: 20.0, fuelConsumedL: 0.91, fuelCost: 95.09, distanceCost: 160.0, totalCost: 255.09 },
    { vehicleId: 'veh-002', model: 'Hyundai Creta', registrationNo: 'KA-01-CD-5678', fuelEfficiencyKmpl: 16.5, totalTrips: 1, totalDistanceKm: 8.5, fuelConsumedL: 0.52, fuelCost: 54.34, distanceCost: 68.0, totalCost: 122.34 },
  ],
  fuelEfficiencyTrends: [
    { month: '2026-07', totalDistanceKm: 45.0, totalFuelConsumedL: 2.2, avgEfficiencyKmpl: 20.45, tripCount: 3 },
    { month: '2026-08', totalDistanceKm: 28.5, totalFuelConsumedL: 1.43, avgEfficiencyKmpl: 19.93, tripCount: 2 },
  ],
};
