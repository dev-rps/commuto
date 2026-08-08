# Database Schema, Tables, Factors, and Data Summary

This document provides a detailed breakdown of all database tables (models), columns (factors), data types, constraints, relationships, and seeded sample data configured in the Commuto database via Prisma ORM (`backend/prisma/schema.prisma` and `backend/prisma/seed.js`).

---

## 1. Overview of Database Enums

| Enum Name | Defined Values | Usage / Purpose |
| :--- | :--- | :--- |
| **`Role`** | `COMPANY_ADMIN`, `EMPLOYEE` | User authorization role within an organization |
| **`TripStatus`** | `PUBLISHED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` | Lifecycle state of a ride |
| **`BookingStatus`** | `BOOKED`, `PAYMENT_PENDING`, `PAYMENT_COMPLETED`, `CANCELLED` | Lifecycle state of a passenger ride reservation |
| **`PaymentMethod`** | `CASH`, `CARD`, `UPI`, `WALLET` | Payment channel used for ride bookings |
| **`PaymentStatus`** | `PENDING`, `SUCCESS`, `FAILED` | Payment processing status |
| **`WalletTxnType`** | `RECHARGE`, `RIDE_PAYMENT`, `REFUND` | Nature of financial movement in employee wallet |

---

## 2. Database Tables & Factors (Columns)

### 1. `Organization`
Stores corporate entities registered on the platform.

* **Factors / Fields**:
  * `id` (`String`, UUID, Primary Key): Unique organization ID
  * `name` (`String`): Company name (e.g., Infosys Ltd)
  * `fuelCostPerL` (`Decimal(10, 2)`): Organization fuel cost rate benchmark (Default: `0.00`)
  * `costPerKm` (`Decimal(10, 2)`): Base reimbursement cost per km (Default: `0.00`)
  * `createdAt` (`DateTime`): Timestamp when record was created
* **Relationships**:
  * Has many `User` records

---

### 2. `User`
Stores system accounts (Employees & Company Admins).

* **Factors / Fields**:
  * `id` (`String`, UUID, Primary Key): Unique user identifier
  * `organizationId` (`String`, Foreign Key -> `Organization.id`): Associated company ID
  * `name` (`String`): Full user name
  * `email` (`String`, Unique): User work email address
  * `passwordHash` (`String`): Password hash value
  * `role` (`Role` enum, Default: `EMPLOYEE`): Access role (`COMPANY_ADMIN` or `EMPLOYEE`)
  * `walletBalance` (`Decimal(10, 2)`, Default: `0.00`): Internal wallet balance
  * `createdAt` (`DateTime`): Account creation timestamp
* **Indexes**: `[organizationId]`
* **Relationships**:
  * Belongs to `Organization`
  * Has many `Vehicle`, `SavedPlace`, `Ride` (as Driver), `Booking` (as Passenger), `WalletTransaction`, `ChatMessage`, `AuditLog`

---

### 3. `Vehicle`
Stores vehicles registered by drivers for offering rides.

* **Factors / Fields**:
  * `id` (`String`, UUID, Primary Key): Unique vehicle identifier
  * `driverId` (`String`, Foreign Key -> `User.id`): Owner/Driver user ID
  * `model` (`String`): Vehicle make and model (e.g., Maruti Suzuki Swift)
  * `registrationNo` (`String`, Unique): License plate / registration number
  * `seatingCap` (`Int`): Total seating capacity
  * `fuelEfficiencyKmpl` (`Float`, Optional): Mileage in km/L (`null` for EVs)
  * `isActive` (`Boolean`, Default: `true`): Vehicle active status
* **Relationships**:
  * Belongs to `User` (Driver)
  * Has many `Ride` records

---

### 4. `SavedPlace`
Stores user-frequented locations (e.g., Home, Office).

* **Factors / Fields**:
  * `id` (`String`, UUID, Primary Key): Location entry ID
  * `userId` (`String`, Foreign Key -> `User.id`): Owner user ID
  * `name` (`String`): Place name tag
  * `latitude` (`Float`): GPS Latitude coordinate
  * `longitude` (`Float`): GPS Longitude coordinate
* **Relationships**:
  * Belongs to `User`

---

### 5. `Ride`
Stores ride offers created by drivers.

* **Factors / Fields**:
  * `id` (`String`, UUID, Primary Key): Unique ride ID
  * `driverId` (`String`, Foreign Key -> `User.id`): Driver offering the ride
  * `vehicleId` (`String`, Foreign Key -> `Vehicle.id`): Vehicle used for the ride
  * `pickupLoc` (`String`): Pickup location address text
  * `pickupLat` (`Float`): Pickup GPS latitude
  * `pickupLng` (`Float`): Pickup GPS longitude
  * `destination` (`String`): Destination address text
  * `destLat` (`Float`): Destination GPS latitude
  * `destLng` (`Float`): Destination GPS longitude
  * `departureTime` (`DateTime`): Scheduled departure time
  * `availableSeats` (`Int`): Open seats available for booking
  * `farePerSeat` (`Decimal(10, 2)`): Price charged per seat
  * `distanceKm` (`Float`, Optional): Estimated trip distance in kilometers
  * `status` (`TripStatus` enum, Default: `PUBLISHED`): Current trip state
  * `createdAt` (`DateTime`): Timestamp of creation
* **Indexes**: `[status]`, `[departureTime]`
* **Relationships**:
  * Belongs to `User` (Driver) and `Vehicle`
  * Has many `Booking`, `RideLocation` (real-time telemetry), `ChatMessage`

---

### 6. `RideLocation`
Tracks real-time telemetry / GPS coordinates during active rides.

* **Factors / Fields**:
  * `id` (`String`, UUID, Primary Key): Location ping ID
  * `rideId` (`String`, Foreign Key -> `Ride.id`): Associated ride ID
  * `latitude` (`Float`): Current GPS latitude
  * `longitude` (`Float`): Current GPS longitude
  * `timestamp` (`DateTime`, Default: `now()`): Ping timestamp
* **Indexes**: `[rideId, timestamp]`
* **Relationships**:
  * Belongs to `Ride`

---

### 7. `Booking`
Stores seat bookings made by passengers for a ride.

* **Factors / Fields**:
  * `id` (`String`, UUID, Primary Key): Booking ID
  * `rideId` (`String`, Foreign Key -> `Ride.id`): Booked ride ID
  * `passengerId` (`String`, Foreign Key -> `User.id`): Passenger user ID
  * `seatsBooked` (`Int`): Number of seats reserved
  * `totalFare` (`Decimal(10, 2)`): Calculated total cost for booking
  * `status` (`BookingStatus` enum, Default: `BOOKED`): Booking state
  * `createdAt` (`DateTime`): Booking timestamp
* **Indexes**: `[passengerId]`
* **Relationships**:
  * Belongs to `Ride` and `User` (Passenger)
  * Has one optional `Payment`

---

### 8. `Payment`
Tracks financial settlement records for ride bookings.

* **Factors / Fields**:
  * `id` (`String`, UUID, Primary Key): Payment transaction ID
  * `bookingId` (`String`, Unique, Foreign Key -> `Booking.id`): Related booking
  * `method` (`PaymentMethod` enum): Payment channel (`CASH`, `CARD`, `UPI`, `WALLET`)
  * `amount` (`Decimal(10, 2)`): Settlement amount
  * `status` (`PaymentStatus` enum, Default: `PENDING`): Settlement state
  * `gatewayRefId` (`String`, Optional): Payment gateway reference ID (e.g. Razorpay)
  * `createdAt` (`DateTime`): Transaction timestamp
* **Relationships**:
  * Belongs to `Booking`

---

### 9. `WalletTransaction`
Tracks audit trail of wallet recharges, payments, and refunds.

* **Factors / Fields**:
  * `id` (`String`, UUID, Primary Key): Wallet transaction ID
  * `userId` (`String`, Foreign Key -> `User.id`): Target user
  * `type` (`WalletTxnType` enum): Transaction type (`RECHARGE`, `RIDE_PAYMENT`, `REFUND`)
  * `amount` (`Decimal(10, 2)`): Amount processed
  * `balanceAfter` (`Decimal(10, 2)`): User wallet balance after transaction
  * `createdAt` (`DateTime`): Transaction timestamp
* **Indexes**: `[userId]`
* **Relationships**:
  * Belongs to `User`

---

### 10. `ChatMessage`
In-app communication messages between drivers and passengers for a ride.

* **Factors / Fields**:
  * `id` (`String`, UUID, Primary Key): Message ID
  * `rideId` (`String`, Foreign Key -> `Ride.id`): Ride context
  * `senderId` (`String`, Foreign Key -> `User.id`): Sender user ID
  * `message` (`String`): Text message content
  * `sentAt` (`DateTime`, Default: `now()`): Sent timestamp
* **Indexes**: `[rideId, sentAt]`
* **Relationships**:
  * Belongs to `Ride` and `User` (Sender)

---

### 11. `AuditLog`
System audit logging for compliance and activity tracking.

* **Factors / Fields**:
  * `id` (`String`, UUID, Primary Key): Log record ID
  * `userId` (`String`, Foreign Key -> `User.id`): Actor user ID
  * `action` (`String`): Performed action description
  * `timestamp` (`DateTime`, Default: `now()`): Event timestamp
* **Relationships**:
  * Belongs to `User`

---

## 3. Seeded Data Summary (Current Database Content)

From `backend/prisma/seed.js`, the database is populated with the following record set:

1. **Organizations (2 Records)**:
   * `Infosys Ltd` (fuelCostPerL: 104.50, costPerKm: 8.00)
   * `Wipro Technologies` (fuelCostPerL: 101.25, costPerKm: 7.50)

2. **Users (10 Records)**:
   * **2 Company Admins**: Arjun Mehta (`arjun.mehta@infosys.com`), Priya Sharma (`priya.sharma@wipro.com`)
   * **8 Employees**: Rahul Nair, Sneha Reddy, Vikram Joshi, Ananya Gupta, Karthik Iyer, Divya Krishnan, Rohan Patel, Meera Bhat (with initial wallet balances ranging ₹150.00 to ₹750.00).

3. **Vehicles (5 Records)**:
   * Maruti Suzuki Swift (`KA-01-AB-1234`, Cap: 4, Mileage: 22.0 kmpl)
   * Hyundai Creta (`KA-01-CD-5678`, Cap: 5, Mileage: 16.5 kmpl)
   * Honda City (`KA-02-EF-9012`, Cap: 4, Mileage: 18.0 kmpl)
   * Toyota Innova Crysta (`KA-03-GH-3456`, Cap: 7, Mileage: 12.0 kmpl)
   * Tata Nexon EV (`KA-01-EV-7890`, Cap: 4, EV - fuelEfficiencyKmpl: null)

4. **Rides (6 Records)**:
   * Bangalore routes (Koramangala -> Electronic City, Whitefield -> MG Road, Indiranagar -> Marathahalli, Jayanagar -> Hebbal, HSR Layout -> Yelahanka, BTM Layout -> Whitefield).
   * Status mix: 3 `PUBLISHED`, 1 `IN_PROGRESS`, 2 `COMPLETED`.

5. **Bookings (7 Records)**:
   * Various statuses: 3 `BOOKED`, 1 `PAYMENT_PENDING`, 2 `PAYMENT_COMPLETED`, 1 `CANCELLED`.

6. **Payments (3 Records)**:
   * `WALLET` payment (₹60.00, `SUCCESS`)
   * `UPI` payment (₹120.00, `SUCCESS`, Gateway ref: `pay_test_upi_001`)
   * `CARD` payment (₹80.00, `PENDING`, Gateway ref: `order_test_card_002`)

7. **Wallet Transactions (7 Records)**:
   * 6 `RECHARGE` transactions initializing employee balances
   * 1 `RIDE_PAYMENT` transaction (₹60.00)
