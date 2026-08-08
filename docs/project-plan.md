# Commuto — Enterprise Carpooling Platform

> **Single source of truth.** Read this before writing any code.
> Last updated: 2026-08-08 (Phase 1 — Database Foundation)

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Database** | PostgreSQL 18 | Local install; Docker Compose available for portability |
| **ORM** | Prisma 7 | Schema-first, driver-adapter pattern (`@prisma/adapter-pg`) |
| **Backend** | Node.js (Express/Fastify — TBD) | REST API + Socket.IO for live tracking |
| **Frontend** | React / Next.js (TBD) | To be decided by frontend team |
| **Auth** | JWT (bcrypt for password hashing) | Seed uses SHA-256 — switch to bcrypt in production code |
| **Payments** | Razorpay (test mode) | `gatewayRefId` stores order/payment IDs |
| **Maps** | Google Maps / Mapbox (TBD) | Coordinates stored as Float lat/lng pairs |
| **Real-time** | Socket.IO | `RideLocation` table backs live tracking |
| **Containerization** | Docker Compose | `docker-compose.yml` at repo root |

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

## File Ownership Map

> **Placeholder** — fill in once team roles are assigned at kickoff.

| Module | Owner | Files / Directories |
|--------|-------|---------------------|
| Database & ORM | TBD | `backend/prisma/`, `docker-compose.yml` |
| Auth (JWT) | TBD | `backend/src/auth/` |
| Rides API | TBD | `backend/src/rides/` |
| Bookings & Payments | TBD | `backend/src/bookings/`, `backend/src/payments/` |
| Wallet | TBD | `backend/src/wallet/` |
| Live Tracking (Socket.IO) | TBD | `backend/src/tracking/` |
| Chat | TBD | `backend/src/chat/` |
| Frontend | TBD | `frontend/` |
| DevOps / CI | TBD | `.github/`, `Dockerfile` |

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
npm install
npx prisma migrate dev
npx prisma db seed

# 4. Verify
npx prisma studio   # Opens browser UI to inspect tables
```
