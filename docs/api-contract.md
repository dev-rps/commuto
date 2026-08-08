# Commuto — API Contract

> **Living document.** Each module owner fills in their endpoints as they build them.
> Base URL: `http://localhost:4000/api`
> Last updated: 2026-08-08 (Phase 2 — route stubs)

---

## Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | — | Register a new user |
| `POST` | `/api/auth/login` | — | Login, returns access + refresh tokens |
| `POST` | `/api/auth/refresh` | Refresh token | Refresh access token |
| `POST` | `/api/auth/logout` | Bearer | Invalidate refresh token |
| `GET` | `/api/auth/me` | Bearer | Get current user profile |

---

## Rides

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/rides` | Bearer | Create/publish a ride |
| `GET` | `/api/rides` | Bearer | List/search rides (filters: status, date, location) |
| `GET` | `/api/rides/:id` | Bearer | Get ride by ID (includes bookings, vehicle) |
| `PATCH` | `/api/rides/:id/status` | Bearer (driver) | Update ride status (start, complete, cancel) |
| `GET` | `/api/rides/my` | Bearer | Get rides offered by current user |

---

## Bookings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/bookings` | Bearer | Book seats on a ride |
| `GET` | `/api/bookings` | Bearer | List my bookings |
| `GET` | `/api/bookings/:id` | Bearer | Get booking details |
| `PATCH` | `/api/bookings/:id/cancel` | Bearer | Cancel a booking |

---

## Payments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/payments/initiate` | Bearer | Initiate payment for a booking |
| `POST` | `/api/payments/verify` | Bearer | Verify payment (Razorpay callback) |
| `GET` | `/api/payments/:bookingId` | Bearer | Get payment status for a booking |

---

## Wallet

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/wallet/balance` | Bearer | Get current wallet balance |
| `POST` | `/api/wallet/recharge` | Bearer | Recharge wallet |
| `GET` | `/api/wallet/transactions` | Bearer | Get wallet transaction history |

---

## Vehicles

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/vehicles` | Bearer | Add a vehicle |
| `GET` | `/api/vehicles` | Bearer | List my vehicles |
| `PATCH` | `/api/vehicles/:id` | Bearer | Update vehicle details |
| `DELETE` | `/api/vehicles/:id` | Bearer | Deactivate a vehicle |

---

## Live Tracking

> Socket.IO events — not REST endpoints.
> Import event names from `SOCKET_EVENTS` in `src/sockets/index.js`.

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `ride:location:{rideId}` | Server → Client | `{ lat, lng, timestamp }` | Driver location broadcast |
| `ride:status:{rideId}` | Server → Client | `{ status }` | Ride status change notification |
| `chat:message:{rideId}` | Bidirectional | `{ senderId, message, sentAt }` | In-ride chat |
| `notification:new:{userId}` | Server → Client | `{ type, title, body }` | User notification |

### Connection

```js
const socket = io("http://localhost:4000", {
  auth: { token: "<JWT access token>" }
});
```

---

## Common Response Patterns

### Success
```json
{ "data": { ... } }
```

### Error
```json
{ "error": "Human-readable message" }
```

### Paginated
```json
{
  "data": [ ... ],
  "pagination": { "page": 1, "limit": 20, "total": 42 }
}
```

---
