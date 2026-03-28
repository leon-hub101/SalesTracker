# SalesTracker — Field Sales Tracking Web App

Full-stack mobile-first web app for tracking field sales agent activity — client visits, check-ins/check-outs, depot inspections, missed orders, and training logs. Luxury Jo Malone-inspired aesthetic.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, shadcn/ui, TanStack Query, Wouter, Framer Motion |
| Backend | Node.js, Express 5, TypeScript (tsx) |
| Database | MongoDB Atlas (cloud NoSQL) via Mongoose |
| Auth | bcrypt + JWT (jsonwebtoken) |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Deployment | Vercel (configured) |

Note: `drizzle.config.ts` exists (PostgreSQL config) but the active database is MongoDB/Mongoose.

## Folder Structure

```
SalesTracker/
├── client/              # React frontend (Vite)
│   └── src/
│       ├── components/  # UI components (shadcn/ui based)
│       ├── pages/       # Page-level components
│       └── lib/         # Utilities (auth, queryClient, etc.)
├── api/                 # Express backend
│   ├── index.ts         # App setup, routes, security middleware
│   ├── auth.ts          # Authentication routes
│   ├── clients.ts       # Client management routes
│   └── lib/             # Backend helpers
├── shared/
│   ├── models/          # Mongoose models (User, Client, Visit, Depot, etc.)
│   └── schema.ts        # Zod schemas (shared validation)
├── vercel.json          # Vercel deployment config
├── design_guidelines.md # Design system (Jo Malone aesthetic)
└── SalesTracker_overview.md  # Comprehensive project overview
```

## Key Commands

```bash
npm run dev             # Concurrent dev: Express server + Vite client
npm run dev:server      # Express API only
npm run dev:client      # Vite frontend only (from client dir)
npm run build           # Build client (dist/public/) + bundle API (dist/index.js)
npm start               # Production: node dist/index.js
npm run seed            # Seed database (tsx server/seed.ts)
```

## Data Models (Mongoose)

- `User` — agents and admins (role: `agent | admin`)
- `Client` — customers with geolocation (lat/lng)
- `Visit` — check-in/check-out records
- `Depot` — location data with inspection details
- `MissedOrder` — incomplete product orders
- `TrainingLog` — agent training activity
- `ProductComplaint` — customer complaints

## Environment Variables

```
MONGODB_URI    # MongoDB Atlas connection string (required)
NODE_ENV       # development | production
CLIENT_URL     # Frontend URL (default: http://localhost:3000)
```

## API Routes

Currently active:
- `GET /api/health` — health check
- `/api/auth/*` — login/register/JWT
- `/api/clients/*` — client CRUD

Disabled (commented out, ready to enable):
- `/api/visits`, `/api/depots`, `/api/missed-orders`, `/api/training-logs`, `/api/product-complaints`

## Design System

Jo Malone-inspired luxury minimalism — documented in `design_guidelines.md`. Mobile-first. Clean typography, generous whitespace.

## Deployment

Vercel config routes `/api/*` to Express, everything else to `dist/public/index.html`.

## Business Docs

OneDrive: `S3rve/SalesTracker/`

## Status

Early development. Auth and client management active. Other modules (visits, depots, etc.) have models and route stubs ready but are commented out pending implementation.
