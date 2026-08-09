# Commuto — Enterprise Carpooling Platform

Commuto is a secure, enterprise-grade carpooling application designed to connect employees within the same organization to share daily commutes.

## 🚀 Project Overview

* **Frontend**: React, TailwindCSS, Vite, Lucide icons (hosted on Vercel)
* **Backend**: Node.js, Express, Socket.IO (hosted on Render)
* **Database**: PostgreSQL (hosted on Neon) with Prisma ORM

## 🛠️ Local Development

### 1. Database Schema
Before running the backend, synchronize the database schema:
```bash
cd backend
npm run db:push
```

### 2. Backend Server
To start the backend server locally:
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend App
To start the frontend app locally:
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Verification & Audit

To check backend health and test API isolation:
```powershell
powershell -File audit_test.ps1
```
