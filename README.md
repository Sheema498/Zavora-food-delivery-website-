# Zavora — Single-Restaurant Food Delivery System

> **Tagline**: Satisfy your hunger instantly  
> **Restaurant Location**: 88 Brigade Road, Ashok Nagar, Bengaluru, Karnataka 560025

Zavora is a streamlined, full-stack, single-restaurant food delivery platform. Re-architected from the ground up around **ONE restaurant (Zavora)**, **ONE restaurant manager**, **ONE dedicated delivery courier**, **customers**, and **ONE super administrator**.

---

## 1. Core Architecture

Unlike multi-tenant marketplace platforms that introduce driver dispatch contention and marketplace noise, Zavora operates a direct, single-restaurant operational pipeline:

- **Single Restaurant Catalog**: 28 database-backed artisanal dishes spanning 9 culinary categories (Pizza, Burgers, Biryani, South Indian, North Indian, Chinese, Snacks, Desserts, Beverages).
- **Four Canonical Roles**: Strictly separated access models (`CUSTOMER`, `RESTAURANT_MANAGER`, `DELIVERY_BOY`, `SUPER_ADMIN`).
- **Dedicated Role Portals**:
  - Customer Website: `/`, `/menu`, `/categories`, `/about`, `/contact`, `/orders`, `/orders/:id/track`
  - Restaurant Manager Portal: `/manager/dashboard`, `/manager/orders`, `/manager/menu`, `/manager/categories`, `/manager/earnings`, `/manager/settings`
  - Delivery Boy Mobile Console: `/delivery/dashboard`, `/delivery/active`, `/delivery/history`, `/delivery/earnings`
  - Super Admin Control Center: `/admin/dashboard`, `/admin/orders`, `/admin/customers`, `/admin/menu`, `/admin/audit-logs`, `/admin/settings`

---

## 2. Canonical Roles & Seed Credentials

All accounts are pre-configured in the database seed script (`server/prisma/seed.ts`).

| Role | Name | Email | Password | Primary Portal |
| :--- | :--- | :--- | :--- | :--- |
| **Customer** | Alex Johnson | `customer@zavora.com` | `Password123!` | `/menu`, `/orders` |
| **Customer (Alt)** | Priya Sharma | `priya@zavora.com` | `Password123!` | `/menu`, `/orders` |
| **Restaurant Manager** | Chef Rajesh Sharma | `manager@zavora.com` | `Password123!` | `/manager/dashboard` |
| **Delivery Boy** | Kiran Kumar (KA-01-ZV-1001) | `delivery@zavora.com` | `Password123!` | `/delivery/dashboard` |
| **Super Admin** | System Administrator | `admin@zavora.com` | `Password123!` | `/admin/dashboard` |

---

## 3. Strict Order State Machine

Order progression enforces a linear state machine with role-based authority matrix:

```
[Customer]             PENDING
                          │
[Manager]                 ▼
                  RESTAURANT_ACCEPTED (or RESTAURANT_REJECTED)
                          │
[Manager]                 ▼
                      PREPARING
                          │
[Manager]                 ▼
                  READY_FOR_PICKUP
                          │
[Manager]                 ▼  (Assigns dedicated Delivery Boy)
                  DELIVERY_ASSIGNED
                          │
[Delivery Boy]            ▼
                  DELIVERY_ACCEPTED
                          │
[Delivery Boy]            ▼
                ARRIVED_AT_RESTAURANT
                          │
[Delivery Boy]            ▼
                      PICKED_UP
                          │
[Delivery Boy]            ▼
                     ON_THE_WAY  (Live GPS Broadcast Active)
                          │
[Delivery Boy]            ▼
                      DELIVERED  (Revenue & Payout Settled)
```

- If an order is rejected or cancelled, demo refunds are triggered automatically.
- Once `DELIVERED`, the courier is credited ₹45 trip pay, and restaurant revenue increments.

---

## 4. GPS Privacy & Keyless Map Setup

### GPS Privacy Enforcement
- **Restricted Access**: Only the **Customer who placed the order** and the **assigned Delivery Boy** can subscribe to or receive live GPS coordinates.
- **Backend Protection**:
  - In Socket.IO (`server/src/socket/index.ts`), `socket.on('join:order')` validates order ownership. Managers and Super Admins are strictly barred from joining `order:tracking:<orderId>`.
  - In REST endpoints (`server/src/services/order.service.ts` and `admin.service.ts`), live GPS telemetry (`currentLatitude`, `currentLongitude`) is stripped from Manager and Admin query responses.

### Keyless Map Cartography
- **No Paid API Keys Required**: Does not require Google Maps, Mapbox, or external API subscriptions.
- **Custom Vector SVG Engine**: `KeylessMap.tsx` renders interactive Bengaluru street grids, landmarks (Brigade Road, MG Road, Cubbon Park, Metro Purple Line), turn-by-turn road curves, and courier waypoints smoothly with standard SVG.
- **Location Simulator**: The courier console includes a real-time GPS telemetry broadcaster that simulates smooth road travel and emits Socket.IO coordinates to the customer's live tracking view.

---

## 5. Super Admin Database Analytics

The Super Admin dashboard (`/admin/dashboard`) computes genuine database aggregations:
- **Interval Filters**: `Today`, `Yesterday`, `Last 7 Days`, `Last 30 Days`, `Monthly`.
- **Food Item Performance**:
  - Food dish name
  - Quantity sold
  - Total revenue generated
  - Percentage of total orders
- **Category Analytics**:
  - Total orders per category
  - Total dish volume cooked
  - Net revenue per category
- **Order Audit Inspection**: Inspect full customer, items, prices, payments, kitchen prep, and courier milestones without exposing live GPS.

---

## 6. Setup and Run Instructions

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- Python (v3.9 or higher, optional for `measure.py`)

### 1. Installation
```bash
# Clone the repository and switch to working branch
git clone https://github.com/Sheema498/QuickBite-food-delivery-website-.git
cd QuickBite
git checkout qbsb

# Install all workspace dependencies
npm install
```

### 2. Database Initialization & Seeding
```bash
# Generate Prisma client and push single-restaurant schema
npm run db:push --workspace=server

# Seed Zavora Restaurant, categories, 28 food items, demo accounts, and historical orders
npm run db:seed --workspace=server
```

### 3. Running the Application
```bash
# Run both Backend and Frontend concurrently
npm run dev
```
- **Backend API & WebSockets**: `http://localhost:5000`
- **Customer Frontend**: `http://localhost:5173` (or `http://localhost:3000`)
- **Health Check**: `http://localhost:5000/api/health`

### 4. Running Verification Builds & Tests
```bash
# Build Server (TypeScript)
npm run build:server

# Build Client (Vite)
npm run build:client

# Run Backend Unit Tests (Vitest)
npm run test:server

# Run Frontend Unit Tests (Vitest)
npm run test:client

# Line of Code Measurement
python measure.py
```

---

## 7. License
Proprietary and Confidential. Copyright © 2026 Zavora. All rights reserved.
