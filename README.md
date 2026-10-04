# Addis Water & Power Tracker

A modern, production-ready civic technology web application for residents of Addis Ababa, Ethiopia to report, track, and monitor **water supply disruptions** and **electricity power outages** in real-time.

![Civic Utility Platform](https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 Key Features

### 1. Public & Resident Portal
* **Interactive Outage Map**: Built with Leaflet.js and OpenStreetMap. Features custom visual markers for Water (💧), Electricity (⚡), Critical/Major incidents (🚨 pulsing), and Restored services (🟢).
* **Live Incident Feed & Search**: Instant filtering by service type, status, sub-city, and keyword search with responsive cards.
* **Citizen Outage Reporting**:
  * Multi-step reporting form with real-time Sub-City ➔ Woreda ➔ Area cascades.
  * Duplicate detection and rate-limiting anti-spam algorithms.
  * Instant feedback: `"Report submitted successfully. Status: Pending verification"`.
* **Outage Details Page**:
  * Maintenance timeline updates from official dispatchers.
  * Community confirmation button (*"I Am Also Affected"*).
  * Restoration reporting (*"Service Restored"* vote counter).
  * High-precision coordinates and localized map pin.
* **Notifications Center**: Real-time alerts when outages affect the user's sub-city, when reports are verified, or when services are restored.
* **User Profile & Watchlist**: Manage primary residence location and watch favorite places (*Home, Office, Parents*).

### 2. Admin & Dispatcher Command Center (`/admin`)
* **Executive Dashboard**: Live 8-KPI monitoring metrics (*Total Users, Total Reports, Active Water, Active Power, Restored, Pending, Today, This Week*).
* **Visual Analytics (Recharts)**:
  * Incidents distribution across all 11 sub-cities.
  * 7-day daily citizen reporting trends.
  * Active outage service type breakdown.
  * Average resolution duration tracker.
* **Citizen Report Triage Queue**: Search, review, verify, and promote citizen reports into active outages or link them to existing incidents.
* **Outage Management**: Create, edit, change status (*PENDING, VERIFIED, ACTIVE, INVESTIGATING, RESTORED, REJECTED*), and log progress timeline updates.
* **Addis Ababa Location Manager**: Manage the complete database-backed hierarchy (*Sub-Cities ➔ Woredas ➔ Areas*) with geographic coordinates.
* **Public Announcements**: Broadcast scheduled maintenance notices with service types, priority levels, and expected downtime windows.
* **User Directory**: Search registered users, change roles (*USER, DISPATCHER, ADMIN*), and toggle account activation.

---

## 🏛️ Addis Ababa Location Hierarchy

Locations are database-driven with full admin CRUD:
```text
Addis Ababa
  ├── Bole (ቦሌ)
  │     ├── Woreda 01 (Atlas, Medhanialem, Rwanda, Peacock)
  │     ├── Woreda 03 (Brass Clinic, Japanese Embassy)
  │     └── Woreda 05 (Edna Mall, Dembel, Olympia)
  ├── Yeka (የካ)
  │     ├── Woreda 06 (Megenagna, Shola, Signal)
  │     └── Woreda 08 (CMC Michael, Kotebe, Ayat)
  ├── Kirkos (ቂርቆስ) (Kazanchis, Meskel Sq, Gotera, Beklobet)
  ├── Arada (አራዳ) (Piassa, 4 Kilo, 6 Kilo, Churchill)
  ├── Lideta (ልደታ) (Lideta Condominiums, Tor Hailoch)
  ├── Addis Ketema (አዲስ ከተማ) (Merkato, Autobis Tera)
  ├── Nifas Silk-Lafto (ንፋስ ስልክ) (Saris, Jomo, Lebu Mebrathail)
  ├── Kolfe Keranio (ኮልፌ ቀራንዮ) (Ayer Tena, Asko, Alem Bank)
  ├── Gullele (ጉለሌ) (Shiromeda, Addisu Gebeya, Entoto)
  ├── Akaky Kaliti (አቃቂ ቃሊቲ) (Kality Customs, Akaki)
  └── Lemi Kura (ለሚ ኩራ) (Summit, Ayat Real Estate, Meri Luke)
```

---

## 🔑 Quick Demo Credentials

One-click demo buttons are provided on the login screens for instant testing:

| Role | Email | Password | Access |
|---|---|---|---|
| **Chief Dispatcher (Admin)** | `admin@addistracker.et` | `AdminPassword123!` | Public + Full Admin Portal (`/admin`) |
| **Field Dispatcher** | `dispatcher@addistracker.et` | `AdminPassword123!` | Public + Outage Verification (`/admin`) |
| **Resident Citizen** | `yosef@example.com` | `UserPassword123!` | Public Website + Profile + Reporting |

---

## 🛠️ Tech Stack

* **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Lucide React
* **Mapping**: Leaflet.js, OpenStreetMap with custom SVG markers
* **Charts**: Recharts
* **Backend API**: Next.js REST Route Handlers
* **Database**: PostgreSQL 18
* **ORM**: Prisma ORM 5.22
* **Authentication**: JWT cookies + bcryptjs password hashing + RBAC
* **Security**: In-memory IP rate limiting, input validation, SQL injection prevention

---

## 🚀 Getting Started

### 1. Database Configuration
Ensure PostgreSQL is running. Configure your connection string in `.env`:
```env
DATABASE_URL="postgresql://postgres:joss5501@localhost:5432/addis_water_power_tracker?schema=public"
JWT_SECRET="addis-water-power-secret-key-2026-prod-token"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Synchronize Schema & Seed Realistic Data
```bash
npx prisma db push
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📡 REST API Endpoints

```text
POST   /api/auth/register           Register new resident
POST   /api/auth/login              Authenticate user/admin
POST   /api/auth/logout             Clear auth token cookie
GET    /api/auth/me                 Current user session profile
PUT    /api/auth/me                 Update profile information
POST   /api/auth/forgot-password    Request password reset token
POST   /api/auth/reset-password     Set new password

GET    /api/outages                 List outages with search and filters
GET    /api/outages/:id             Get single outage with timeline and reports
POST   /api/outages                 Create new outage (Admin/Dispatcher)
PUT    /api/outages/:id             Update outage status / severity / ETA
DELETE /api/outages/:id             Delete outage (Admin)

POST   /api/outages/:id/confirm     Confirm "I Am Also Affected"
POST   /api/outages/:id/restore     Report service has returned
POST   /api/outages/:id/updates     Post progress milestone to timeline

GET    /api/reports                 List citizen reports (with status filter)
POST   /api/reports                 Submit citizen outage report (Anti-spam)
GET    /api/reports/:id             Get single report details
PUT    /api/reports/:id             Edit report
POST   /api/reports/:id/verify      Verify and promote to active outage
POST   /api/reports/:id/reject      Reject report with reason
DELETE /api/reports/:id             Delete report

GET    /api/locations               Full Addis Ababa hierarchy (Sub-Cities -> Woredas -> Areas)
GET    /api/sub-cities              List sub-cities
POST   /api/sub-cities              Create sub-city (Admin)
GET    /api/woredas                 List woredas by sub-city
POST   /api/woredas                 Create woreda (Admin)

GET    /api/notifications           User notifications & unread badge count
PUT    /api/notifications           Mark all notifications as read
PUT    /api/notifications/:id/read  Mark single notification as read

GET    /api/announcements           Active maintenance announcements
POST   /api/announcements           Broadcast announcement (Admin)
PUT    /api/announcements/:id       Edit / toggle active status
DELETE /api/announcements/:id       Delete announcement

GET    /api/admin/stats             Dashboard KPIs, charts, and metrics
GET    /api/admin/users             User directory and role management
PUT    /api/admin/users             Toggle user active status or change role
DELETE /api/admin/users             Delete user
```

---

## 📞 Addis Ababa Emergency Contacts
* **Water & Sewerage (AAWSA)**: `944` (Toll-free 24/7)
* **Electricity Utility (EEU)**: `905` (Toll-free 24/7)
* **Fire & Emergency Services**: `939` (Toll-free 24/7)