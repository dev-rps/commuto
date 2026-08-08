# Database User Credentials & Email List

This document lists all user accounts, emails, roles, organizations, and passwords present in the Commuto database (`backend/prisma/seed.js`).

> **Default Password for ALL Accounts:** `pass1234`

---

## 1. Super Admin Account

| Name | Role | Email | Password | Organization / Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `SUPER_ADMIN` | `superadmin@gmail.com` | `pass1234` | Full Platform & Database Control |

---

## 2. Company Admin Accounts

| Name | Role | Email | Password | Organization |
| :--- | :--- | :--- | :--- | :--- |
| **Arjun Mehta** | `COMPANY_ADMIN` | `admin@infosys.com` | `pass1234` | Infosys Ltd |
| **Priya Sharma** | `COMPANY_ADMIN` | `admin@wipro.com` | `pass1234` | Wipro Technologies |
| **Rajesh Kumar** | `COMPANY_ADMIN` | `admin@tcs.com` | `pass1234` | TCS (Tata Consultancy Services) |

---

## 3. Employee Accounts

| Name | Role | Email | Password | Organization | Initial Wallet Balance |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Neha Sharma** | `EMPLOYEE` | `neha@infosys.com` | `pass1234` | Infosys Ltd | ₹500.00 |
| **Suraj Verma** | `EMPLOYEE` | `suraj@tcs.com` | `pass1234` | TCS | ₹600.00 |
| **Amit Patel** | `EMPLOYEE` | `amit@wipro.com` | `pass1234` | Wipro Technologies | ₹450.00 |
| **Rahul Nair** | `EMPLOYEE` | `rahul.nair@infosys.com` | `pass1234` | Infosys Ltd | ₹350.00 |
| **Sneha Reddy** | `EMPLOYEE` | `sneha.reddy@infosys.com` | `pass1234` | Infosys Ltd | ₹400.00 |
| **Karthik Iyer** | `EMPLOYEE` | `karthik.iyer@wipro.com` | `pass1234` | Wipro Technologies | ₹300.00 |

---

## 4. Summary Count by Role

* 👑 **Super Admin (1)**: `superadmin@gmail.com`
* 🏢 **Company Admins (3)**: `admin@infosys.com`, `admin@wipro.com`, `admin@tcs.com`
* 🚗 **Employees (6)**: `neha@infosys.com`, `suraj@tcs.com`, `amit@wipro.com`, `rahul.nair@infosys.com`, `sneha.reddy@infosys.com`, `karthik.iyer@wipro.com`
* 🔑 **Universal Password**: `pass1234`
