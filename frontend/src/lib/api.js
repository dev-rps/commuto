import axios from 'axios';
import * as mock from '../mocks/mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:4000/api`;
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const api = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        localStorage.setItem('accessToken', data.accessToken);
        error.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(error.config);
      } catch {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

let activeMockUser = mock.currentUser;

// ── Auth ──────────────────────────────────────────────────────────
export async function login(email, password) {
  if (USE_MOCKS) {
    await delay();
    let role = 'EMPLOYEE';
    if (email === 'superadmin@gmail.com') role = 'SUPER_ADMIN';
    else if (email.includes('admin')) role = 'COMPANY_ADMIN';

    activeMockUser = {
      id: `user-${email}`,
      name: email.split('@')[0].toUpperCase(),
      email,
      role,
      walletBalance: 500,
      organization: { id: 'org-1', name: email.split('@')[1]?.split('.')[0]?.toUpperCase() || 'Org' },
    };
    return { user: activeMockUser, accessToken: 'mock-access-token' };
  }
  const { data } = await api.post('/auth/login', { email, password }); return data;
}
export async function signup(payload) {
  if (USE_MOCKS) { await delay(); activeMockUser = { ...mock.currentUser, ...payload }; return { user: activeMockUser, accessToken: 'mock-access-token' }; }
  const { data } = await api.post('/auth/signup', payload); return data;
}
export async function getMe() {
  if (USE_MOCKS) { await delay(100); return activeMockUser; }
  const { data } = await api.get('/auth/me'); return data.user;
}
export async function getOrganizations() {
  if (USE_MOCKS) { await delay(100); return mock.organizations; }
  try {
    const { data } = await api.get('/organizations'); 
    return data.organizations;
  } catch (error) {
    return mock.organizations;
  }
}
export async function updateOrganizationPolicy(payload) {
  if (USE_MOCKS) { await delay(); return { message: 'Organization policy updated', organization: { ...mock.organizations[0], ...payload } }; }
  const { data } = await api.patch('/organizations/my/policy', payload); return data;
}

const MOCK_RIDES_KEY = 'commuto_mock_rides';

function getStoredMockRides() {
  try {
    const stored = localStorage.getItem(MOCK_RIDES_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Error reading mock rides from localStorage', e);
  }
  return mock.rides;
}

function saveStoredMockRides(rides) {
  try {
    localStorage.setItem(MOCK_RIDES_KEY, JSON.stringify(rides));
  } catch (e) {
    console.error('Error saving mock rides to localStorage', e);
  }
}

// ── Rides ─────────────────────────────────────────────────────────
export async function searchRides(params) {
  if (USE_MOCKS) {
    await delay();
    const rides = getStoredMockRides();
    return rides.filter((r) => r.status === 'PUBLISHED' && (r.availableSeats || 1) >= (params?.seats || 1));
  }
  const { data } = await api.get('/rides/search', { params }); return data.rides;
}
export async function getRide(id) {
  if (USE_MOCKS) {
    await delay(100);
    const rides = getStoredMockRides();
    const ride = rides.find((r) => r.id === id);
    if (!ride) throw new Error('Ride not found');
    return ride;
  }
  const { data } = await api.get(`/rides/${id}`); return data.ride;
}
export async function getMyRides() {
  if (USE_MOCKS) {
    await delay();
    const rides = getStoredMockRides();
    return rides.filter((r) => r.driverId === activeMockUser.id);
  }
  const { data } = await api.get('/rides/my'); return data.rides;
}
export async function publishRide(payload) {
  if (USE_MOCKS) {
    await delay();
    const newRide = {
      ...payload,
      id: `ride-${Date.now()}`,
      driverId: activeMockUser.id,
      driver: { id: activeMockUser.id, name: activeMockUser.name, email: activeMockUser.email },
      vehicle: { id: payload.vehicleId, model: 'Sedan', registrationNo: 'KA-01-AB-1234' },
      status: 'PUBLISHED',
      createdAt: new Date().toISOString(),
    };
    const rides = getStoredMockRides();
    rides.unshift(newRide);
    saveStoredMockRides(rides);
    return newRide;
  }
  const { data } = await api.post('/rides', payload); return data.ride;
}
export async function updateRideStatus(rideId, status) {
  if (USE_MOCKS) {
    await delay(100);
    const rides = getStoredMockRides();
    const updated = rides.map((r) => (r.id === rideId ? { ...r, status } : r));
    saveStoredMockRides(updated);
    return { id: rideId, status };
  }
  const { data } = await api.patch(`/rides/${rideId}/status`, { status }); return data.ride;
}
export async function startRide(rideId, otp) {
  if (USE_MOCKS) { await delay(); return { id: rideId, status: 'IN_PROGRESS' }; }
  const { data } = await api.post(`/rides/${rideId}/start`, { otp }); return data.ride;
}

// ── Bookings ──────────────────────────────────────────────────────
export async function bookRide(rideId, seatsBooked) {
  if (USE_MOCKS) { await delay(); const ride = mock.rides.find((r) => r.id === rideId); return { id: `book-${Date.now()}`, rideId, passengerId: mock.currentUser.id, seatsBooked, totalFare: ride ? ride.farePerSeat * seatsBooked : 0, status: 'BOOKED' }; }
  const { data } = await api.post(`/rides/${rideId}/book`, { rideId, seatsBooked }); return data.booking;
}
export async function getMyBookings() {
  if (USE_MOCKS) { await delay(); return mock.bookings.filter((b) => b.passengerId === mock.currentUser.id).map((b) => ({ ...b, ride: mock.rides.find((r) => r.id === b.rideId) })); }
  const { data } = await api.get('/bookings/me'); return data.bookings;
}
export async function cancelBooking(bookingId) {
  if (USE_MOCKS) { await delay(200); return { id: bookingId, status: 'CANCELLED' }; }
  const { data } = await api.patch(`/bookings/${bookingId}/cancel`); return data.booking;
}

// ── Payments ──────────────────────────────────────────────────────
export async function initiatePayment(bookingId, method) {
  if (USE_MOCKS) { await delay(); return { payment: { id: `pay-${Date.now()}`, bookingId, method, amount: 80, status: 'SUCCESS', gatewayRefId: null }, message: `${method} payment completed` }; }
  const { data } = await api.post(`/bookings/${bookingId}/payment`, { bookingId, method }); return data;
}
export async function verifyPayment(bookingId, payload) {
  if (USE_MOCKS) { await delay(); return { message: 'Payment verified', payment: { status: 'SUCCESS' } }; }
  const { data } = await api.post(`/bookings/${bookingId}/payment/verify`, payload); return data;
}

// ── Wallet ────────────────────────────────────────────────────────
export async function getWallet() {
  if (USE_MOCKS) { await delay(); return { walletBalance: mock.currentUser.walletBalance, transactions: mock.walletTransactions }; }
  const { data } = await api.get('/wallet/me'); return data;
}
export async function getWalletTransactions() {
  const data = await getWallet();
  return Array.isArray(data.transactions) ? data.transactions : Array.isArray(data) ? data : [];
}
export async function rechargeWallet(amount) {
  if (USE_MOCKS) { await delay(); const newBalance = mock.currentUser.walletBalance + amount; return { walletBalance: newBalance, message: `Wallet recharged with ₹${amount}`, transaction: { id: `wt-${Date.now()}`, userId: mock.currentUser.id, type: 'RECHARGE', amount, balanceAfter: newBalance } }; }
  const { data } = await api.post('/wallet/recharge', { amount }); return data;
}

// ── Vehicles ──────────────────────────────────────────────────────
export async function getMyVehicles() {
  if (USE_MOCKS) { await delay(); return mock.vehicles.filter((v) => v.driverId === mock.currentUser.id); }
  const { data } = await api.get('/vehicles/me'); return data.vehicles;
}
export async function createVehicle(payload) {
  if (USE_MOCKS) { await delay(); return { ...payload, id: `veh-${Date.now()}`, driverId: mock.currentUser.id, isActive: true }; }
  const { data } = await api.post('/vehicles', payload); return data.vehicle;
}
export async function updateVehicle(vehicleId, payload) {
  if (USE_MOCKS) { await delay(); return { ...payload, id: vehicleId }; }
  const { data } = await api.patch(`/vehicles/${vehicleId}`, payload); return data.vehicle;
}

// ── Chat ──────────────────────────────────────────────────────────
export async function getChatMessages(rideId) {
  if (USE_MOCKS) { await delay(100); return mock.chatMessages[rideId] || []; }
  const { data } = await api.get(`/rides/${rideId}/messages`); return data.messages;
}
export async function sendMessage(rideId, message) {
  if (USE_MOCKS) { await delay(100); return { id: `msg-${Date.now()}`, rideId, senderId: mock.currentUser.id, message, sentAt: new Date().toISOString() }; }
  const { data } = await api.post(`/rides/${rideId}/messages`, { message }); return data.message;
}

// ── Reports (admin) ───────────────────────────────────────────────
export async function getReportSummary() {
  if (USE_MOCKS) { await delay(); return mock.reportSummary; }
  const { data } = await api.get('/reports/summary'); return data;
}
export async function getPlatformOverview() {
  if (USE_MOCKS) { await delay(); return mock.platformOverview || {}; }
  const { data } = await api.get('/reports/platform-overview'); return data;
}
export async function getOrgMembers() {
  if (USE_MOCKS) { await delay(); return []; }
  const { data } = await api.get('/organizations/my/members'); return data.members;
}
export async function getOrgRides() {
  if (USE_MOCKS) { await delay(); return []; }
  const { data } = await api.get('/organizations/my/rides'); return data.rides;
}
export async function getOrgBookings() {
  if (USE_MOCKS) { await delay(); return []; }
  const { data } = await api.get('/organizations/my/bookings'); return data.bookings;
}

// ── Saved Places ──────────────────────────────────────────────────
export async function getSavedPlaces() {
  if (USE_MOCKS) { await delay(); return mock.savedPlaces.filter((p) => p.userId === mock.currentUser.id); }
  const { data } = await api.get('/saved-places'); return data.places;
}
export async function createSavedPlace(payload) {
  if (USE_MOCKS) { await delay(); return { ...payload, id: `place-${Date.now()}`, userId: mock.currentUser.id }; }
  const { data } = await api.post('/saved-places', payload); return data.place;
}
export async function addSavedPlace(payload) {
  return createSavedPlace(payload);
}
export async function deleteSavedPlace(placeId) {
  if (USE_MOCKS) { await delay(100); return { id: placeId }; }
  const { data } = await api.delete(`/saved-places/${placeId}`); return data;
}

export { api };
