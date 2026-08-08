# Commuto — Enterprise Carpooling Platform

> **Single source of truth.** Read this before writing any code.
> Last updated: 2026-08-08 (Phase 2 — Express Backend Skeleton)

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Database** | PostgreSQL 18 | Local install; Docker Compose available for portability |
| **ORM** | Prisma 7 | Schema-first, driver-adapter pattern (`@prisma/adapter-pg`) |
| **Backend** | Node.js + Express 5 | REST API, CommonJS modules |
| **Real-time** | Socket.IO 4.x | JWT-authenticated handshake, room-based events |
| **Auth** | JWT (access + refresh tokens) | `jsonwebtoken`, bcrypt for password hashing |
| **Validation** | Zod 4 | Shared schemas in `src/schemas/index.js` |
| **Payments** | Razorpay (test mode) | `gatewayRefId` stores order/payment IDs |
| **Maps** | Google Maps / Mapbox (TBD) | Coordinates stored as Float lat/lng pairs |
| **Frontend** | React + Vite (TBD) | CORS defaults to `http://localhost:5173` |
| **Containerization** | Docker Compose | `docker-compose.yml` at repo root |
| **Deployment** | Render | `server.js` exports `module.exports = server` for Render |

---

## Database Schema

> **Canonical source:** [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

enum Role {
  COMPANY_ADMIN
  EMPLOYEE
}

enum TripStatus {
  PUBLISHED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum BookingStatus {
  BOOKED
  PAYMENT_PENDING
  PAYMENT_COMPLETED
  CANCELLED
}

enum PaymentMethod {
  CASH
  CARD
  UPI
  WALLET
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
}

enum WalletTxnType {
  RECHARGE
  RIDE_PAYMENT
  REFUND
}

model Organization {
  id             String   @id @default(uuid())
  name           String
  fuelCostPerL   Decimal  @db.Decimal(10, 2) @default(0.00)
  costPerKm      Decimal  @db.Decimal(10, 2) @default(0.00)
  createdAt      DateTime @default(now())

  users          User[]
}

model User {
  id             String    @id @default(uuid())
  organizationId String
  name           String
  email          String    @unique
  passwordHash   String
  role           Role      @default(EMPLOYEE)
  walletBalance  Decimal   @db.Decimal(10, 2) @default(0.00)
  createdAt      DateTime  @default(now())

  organization   Organization @relation(fields: [organizationId], references: [id])
  vehicles       Vehicle[]
  savedPlaces    SavedPlace[]
  ridesOffered   Ride[]       @relation("DriverRides")
  ridesBooked    Booking[]    @relation("PassengerBookings")
  walletTxns     WalletTransaction[]
  chatMessages   ChatMessage[]
  auditLogs      AuditLog[]

  @@index([organizationId])
}

model Vehicle {
  id                 String   @id @default(uuid())
  driverId           String
  model              String
  registrationNo     String   @unique
  seatingCap         Int
  fuelEfficiencyKmpl Float?
  isActive           Boolean  @default(true)

  driver             User     @relation(fields: [driverId], references: [id])
  rides              Ride[]
}

model SavedPlace {
  id        String   @id @default(uuid())
  userId    String
  name      String
  latitude  Float
  longitude Float

  user      User     @relation(fields: [userId], references: [id])
}

model Ride {
  id             String     @id @default(uuid())
  driverId       String
  vehicleId      String
  pickupLoc      String
  pickupLat      Float
  pickupLng      Float
  destination    String
  destLat        Float
  destLng        Float
  departureTime  DateTime
  availableSeats Int
  farePerSeat    Decimal    @db.Decimal(10, 2)
  distanceKm     Float?
  status         TripStatus @default(PUBLISHED)
  createdAt      DateTime   @default(now())

  driver         User       @relation("DriverRides", fields: [driverId], references: [id])
  vehicle        Vehicle    @relation(fields: [vehicleId], references: [id])
  bookings       Booking[]
  locations      RideLocation[]
  chatMessages   ChatMessage[]

  @@index([status])
  @@index([departureTime])
}

model RideLocation {
  id        String   @id @default(uuid())
  rideId    String
  latitude  Float
  longitude Float
  timestamp DateTime @default(now())

  ride      Ride     @relation(fields: [rideId], references: [id])

  @@index([rideId, timestamp])
}

model Booking {
  id             String        @id @default(uuid())
  rideId         String
  passengerId    String
  seatsBooked    Int
  totalFare      Decimal       @db.Decimal(10, 2)
  status         BookingStatus @default(BOOKED)
  createdAt      DateTime      @default(now())

  ride           Ride          @relation(fields: [rideId], references: [id])
  passenger      User          @relation("PassengerBookings", fields: [passengerId], references: [id])
  payment        Payment?

  @@index([passengerId])
}

model Payment {
  id             String        @id @default(uuid())
  bookingId      String        @unique
  method         PaymentMethod
  amount         Decimal       @db.Decimal(10, 2)
  status         PaymentStatus @default(PENDING)
  gatewayRefId   String?       // Razorpay test-mode order/payment ID
  createdAt      DateTime      @default(now())

  booking        Booking       @relation(fields: [bookingId], references: [id])
}

model WalletTransaction {
  id             String        @id @default(uuid())
  userId         String
  type           WalletTxnType
  amount         Decimal       @db.Decimal(10, 2)
  balanceAfter   Decimal       @db.Decimal(10, 2)
  createdAt      DateTime      @default(now())

  user           User          @relation(fields: [userId], references: [id])

  @@index([userId])
}

model ChatMessage {
  id        String   @id @default(uuid())
  rideId    String
  senderId  String
  message   String
  sentAt    DateTime @default(now())

  ride      Ride     @relation(fields: [rideId], references: [id])
  sender    User     @relation(fields: [senderId], references: [id])

  @@index([rideId, sentAt])
}

model AuditLog {
  id        String   @id @default(uuid())
  userId    String
  action    String
  timestamp DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])
}
```

### Entity-Relationship Summary

```
Organization 1──* User
User 1──* Vehicle
User 1──* SavedPlace
User 1──* Ride          (as driver, via "DriverRides")
User 1──* Booking       (as passenger, via "PassengerBookings")
User 1──* WalletTransaction
User 1──* ChatMessage
User 1──* AuditLog
Vehicle 1──* Ride
Ride 1──* Booking
Ride 1──* RideLocation  (live tracking breadcrumbs)
Ride 1──* ChatMessage
Booking 1──0..1 Payment
```

---

## Socket.IO Event Convention

All event names are defined in `src/sockets/index.js` → `SOCKET_EVENTS`.
Do **not** invent ad-hoc event strings — import from SOCKET_EVENTS.

| Constant | Pattern | Example |
|----------|---------|---------|
| `rideLocation(rideId)` | `ride:location:{rideId}` | `ride:location:abc-123` |
| `rideStatus(rideId)` | `ride:status:{rideId}` | `ride:status:abc-123` |
| `chatMessage(rideId)` | `chat:message:{rideId}` | `chat:message:abc-123` |
| `notificationNew(userId)` | `notification:new:{userId}` | `notification:new:xyz-456` |

### Room-join on connect

| Role | Rooms joined |
|------|-------------|
| Every user | `user:{userId}` |
| COMPANY_ADMIN | `user:{userId}` + `admin:{organizationId}` (org-scoped, not global) |

---

## File Ownership Map

| Module | Owner | Files / Directories |
|--------|-------|---------------------|
| Auth / Vehicle / Ride / Sockets | **Lead** | `src/routes/auth.js`, `src/routes/vehicles.js`, `src/routes/rides.js`, `src/sockets/`, `src/lib/`, `src/middleware/` |
| Booking / Payment / Wallet / Chat / Reports | **Member 3** | `src/routes/bookings.js`, `src/routes/payments.js`, `src/routes/wallet.js`, `src/routes/chat.js` |
| Frontend | **Member 2** | `frontend/` |
| Database & ORM | **Lead** | `prisma/`, `docker-compose.yml` |
| Docs & DevOps | **Lead** | `docs/`, `.github/`, `Dockerfile` |

---

## Backend Directory Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Canonical schema
│   ├── seed.js                # Seed data (Bangalore coords)
│   └── migrations/            # Auto-generated by Prisma
├── prisma.config.ts           # Prisma 7 config (DB URL, seed command)
├── src/
│   ├── app.js                 # Express app factory
│   ├── server.js              # HTTP server + Socket.IO (exports for Render)
│   ├── lib/
│   │   ├── prismaClient.js    # Singleton Prisma client (global-reuse pattern)
│   │   └── jwt.js             # sign/verify helpers (NO hardcoded secrets)
│   ├── middleware/
│   │   ├── requireAuth.js     # JWT Bearer token verification
│   │   └── requireRole.js     # Role gate factory
│   ├── schemas/
│   │   └── index.js           # Shared Zod validation schemas
│   ├── sockets/
│   │   └── index.js           # Socket.IO setup, SOCKET_EVENTS, getIO()
│   └── routes/                # API route modules (added per-module)
├── package.json
├── .env.example
└── .env                       # NOT committed
```

---

## Git Workflow Rules

1. **Branch naming**: `feat/<module>-<short-desc>`, `fix/<module>-<short-desc>`, `chore/<desc>`
2. **Never push directly to `main`** — all work goes through PRs (even during the hackathon; fast-forward merges are fine)
3. **Pull before you push** — always `git pull --rebase origin main` before pushing
4. **One commit per logical unit** — don't squash everything into one giant commit
5. **Commit message format**: `type: short description` (e.g., `feat: add ride search endpoint`)
   - Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`
6. **Never commit `.env`** — only `.env.example` goes into the repo
7. **Schema changes require team notification** — ping the group before modifying `schema.prisma`
8. **Seed data resets**: after schema changes, run `npx prisma migrate reset` to re-apply migrations + seed

---

## Quick Start (for new team members)

```bash
# 1. Clone and enter
git clone https://github.com/dev-rps/commuto.git
cd commuto

# 2. Option A: Docker (recommended)
docker compose up -d

# 2. Option B: Local Postgres
# Create database & user manually (see docker-compose.yml for credentials)

# 3. Backend setup
cd backend
cp .env.example .env
# Add JWT_ACCESS_SECRET and JWT_REFRESH_SECRET to .env
npm install
npx prisma migrate dev
npx prisma db seed

# 4. Run
npm run dev          # starts with --watch for auto-reload

# 5. Verify
curl http://localhost:4000/api/health
npx prisma studio   # Opens browser UI to inspect tables
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | ✅ | Secret for signing access tokens (15m expiry) |
| `JWT_REFRESH_SECRET` | ✅ | Secret for signing refresh tokens (7d expiry) |
| `CORS_ORIGIN` | ❌ | Frontend URL (default: `http://localhost:5173`) |
| `PORT` | ❌ | Server port (default: `4000`) |
