# QuickBite — Real-Time Food Delivery Management Platform

QuickBite is an enterprise-grade, full-stack real-time food delivery management platform connecting **Customers**, **Restaurants**, **Delivery Partners (Couriers)**, and **Platform Administrators** in an end-to-end synchronized order fulfillment lifecycle.

---

## Installation

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- Python (v3.9.0 or higher)

### Step-by-Step Setup
1. Clone or navigate to the repository directory:
   ```bash
   cd QuickBite
   ```

2. Install all workspace dependencies across server and client:
   ```bash
   npm install
   ```

3. (Optional) Set up Python environment for analytics & measurement tools:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```

4. Initialize database schema and seed pre-configured demo datasets:
   ```bash
   npm run db:setup
   ```

---

## Build

### Compiling Backend & Frontend
To compile both the server TypeScript backend and the client React/Vite bundle:
```bash
npm run build
```

Individual workspace build commands:
```bash
# Compile Server TypeScript (tsc)
npm run build:server

# Compile Client Production Bundle (Vite)
npm run build:client
```

### Container Build (Docker)
Build the production Docker container:
```bash
docker build -t quickbite-platform:latest .
```

---

## Run

### Development Mode (Concurrent Server & Client)
```bash
npm run dev
```
- Backend API & WebSockets: **http://localhost:5000**
- Frontend Client Web UI: **http://localhost:3000**

### Production Mode
```bash
# Start backend server
npm start
```

### Docker Run
```bash
docker run -p 5000:5000 quickbite-platform:latest
```

---

## Dependencies

### Core Platform Dependencies
- **Runtime & Web Framework**: Node.js, Express (`^4.19.2`), TypeScript (`^5.4.5`)
- **Real-Time WebSockets**: Socket.IO (`^4.7.5`)
- **Database & ORM**: Prisma ORM (`^5.14.0`), SQLite
- **Security & Validation**: JSON Web Tokens (`jsonwebtoken`), BcryptJS (`bcryptjs`), Helmet (`^7.1.0`), Zod (`^3.23.8`), CORS
- **Frontend Framework**: React 18 (`^18.3.1`), React Router DOM (`^6.23.1`), Vite (`^5.2.11`), Tailwind CSS (`^3.4.3`), Lucide Icons (`^0.378.0`)
- **Testing Framework**: Vitest (`^1.6.0`), Supertest (`^7.0.0`)
- **Cartography & Audio**: Zero-key SVG Vector Cartographic Engine, Web Audio API Sound Synthesizer

---

## Usage

### 1. Multi-Role Demo Credentials

| Role | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **CUSTOMER** | `customer@example.com` | `Password123!` | Browse multi-cuisine restaurants, dietary filter, cart, coupon discounts, checkout, live turn-by-turn order tracking, rating & reviews. |
| **RESTAURANT** | `restaurant@example.com` | `Password123!` | Live kitchen queue, accept orders with estimated prep timers (10–60 mins), mark cooking / ready for pickup, manage menu items & in-stock toggles. |
| **DELIVERY_PARTNER** | `delivery@example.com` | `Password123!` | Online/offline duty toggle, accept courier assignments, mark arrived at kitchen, confirm food pickup, live turn-by-turn road GPS broadcaster, complete doorstep delivery. |
| **ADMIN** | `admin@example.com` | `Password123!` | Central dispatch control room, manual courier assignment, platform gross GMV & commission telemetry, user access moderation, security audit trail, system-wide broadcast alerts. |

*Quick login buttons for all 4 roles are also available directly on the login screen for instant 1-click evaluation.*

### 2. Complete 4-Role Order Lifecycle
1. **Customer Places Order**: Adds dishes from restaurant menu to cart, applies discount coupons, selects delivery address, and places order.
2. **Restaurant Kitchen Queue**: Chef receives instant acoustic chime via Web Audio API and real-time Socket.IO alert. Sets prep timer (10–60m) and accepts order.
3. **Cooking & Packaging**: Chef transitions order to `PREPARING` and then marks `READY_FOR_PICKUP`.
4. **Courier Assignment**: Admin assigns available courier partner or auto-dispatch allocates nearest online driver.
5. **Pickup & Transit**: Courier accepts dispatch, navigates to kitchen, confirms pickup, and begins live road navigation (`ON_THE_WAY`).
6. **Live Driver GPS Broadcasting**: Driver location simulator streams live turn-by-turn coordinates, heading, and speed to customer tracking map.
7. **Doorstep Delivery & Settlement**: Driver confirms delivery. Customer submits star ratings and feedback.

### 3. Testing & Verification
```bash
# Run backend test suite
npm run test:server

# Run production line of code measurement counter
python measure.py
```
