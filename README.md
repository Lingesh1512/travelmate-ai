# 🌍 TravelMate AI – Smart Travel Planning Platform

> **"Plan Less. Travel More."**  
> *Your intelligent companion for unforgettable journeys.*

TravelMate AI is a production-grade full-stack travel platform designed to revolutionize the way travelers discover destinations, generate intelligent day-by-day itineraries, track budgets, organize expenses, manage packing checklists, and explore interactive maps.

---

## 🚀 Live Demo & Services

| Service | Local URL | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | [http://localhost:5173](http://localhost:5173) | Vite + React single-page application |
| **Backend REST API** | [http://localhost:5000](http://localhost:5000) | Express.js + Node.js API server |
| **API Health Check** | [http://localhost:5000/health](http://localhost:5000/health) | Real-time backend status check |
| **Database** | `localhost:3306` (`travelmate_ai`) | MySQL 8.0 schema & seed data |

---

## 🔑 Demo Login Credentials

Pre-configured accounts with instant 1-click login buttons on the Login page:

- **Regular Traveler:**
  - **Email:** `demo@travelmate.com`
  - **Password:** `Demo@123`
- **Administrator:**
  - **Email:** `admin@travelmate.com`
  - **Password:** `Admin@123`

---

## 🛠️ Tech Stack

### Frontend (`client/`)
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS + Glassmorphism + Modern Dark/Light Theme System
- **Maps:** Leaflet + OpenStreetMap + React-Leaflet
- **Charts:** Recharts (interactive budget and expense analytics)
- **Icons:** Lucide React + Custom SVGs
- **Routing:** React Router v7
- **Toasts & Feedback:** React Hot Toast
- **Date Utilities:** Date-fns

### Backend (`server/`)
- **Runtime:** Node.js + Express.js
- **Database:** MySQL 8.0 (`mysql2/promise` connection pooling)
- **Authentication:** JWT (JSON Web Tokens) + BcryptJS password hashing
- **Security:** Helmet, CORS, Express-Rate-Limit
- **Logging:** Morgan

### Database (`database/`)
- 10 Relational Tables: `users`, `categories`, `destinations`, `attractions`, `trips`, `itinerary`, `favorites`, `expenses`, `packing_items`, `budget_plans`
- 18 Curated Destinations (Ooty, Goa, Manali, Jaipur, Bali, Paris, Maldives, Switzerland, Dubai, etc.)

---

## 📂 Project Structure

```
travelmate-ai/
├── client/                     # Frontend Vite + React application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI & layout components
│   │   ├── context/            # AuthContext, ThemeContext
│   │   ├── layouts/            # MainLayout, AdminLayout
│   │   ├── pages/              # Landing, Explore, TripPlanner, MyTrips, TripDetail, MapPage, etc.
│   │   │   └── admin/          # Admin Dashboard, Users, Destinations, Trips
│   │   ├── services/           # Axios API client
│   │   ├── App.jsx             # Main router & routes definition
│   │   └── index.css           # Design tokens, custom animations, utilities
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend Express REST API
│   ├── config/                 # MySQL connection pool
│   ├── controllers/            # Route controllers (Auth, Trip, Planner, etc.)
│   ├── middleware/             # Auth JWT guard, rate-limiters
│   ├── routes/                 # Express API endpoints
│   ├── utils/                  # Database seeder scripts
│   ├── .env.example            # Environment template
│   ├── package.json
│   └── server.js               # Express application entry
│
├── database/                   # Database files
│   └── travelmate_ai.sql       # Complete MySQL schema & seed data
│
└── README.md
```

---

## ⚡ Quick Start Guide

### 1. Database Setup
Ensure MySQL is running on port 3306, create `server/.env` from `server/.env.example`:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=travelmate_ai
DB_PORT=3306
JWT_SECRET=travelmate_ai_super_secret_jwt_key_2024_production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

Run the database seeder:
```bash
cd server
npm run seed
```

### 2. Start Backend Server
```bash
cd server
npm start
# Server runs on http://localhost:5000
```

### 3. Start Frontend Client
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```
