# SalesTrackr - Complete Application Overview

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [File Structure](#file-structure)
5. [Data Models](#data-models)
6. [API Endpoints](#api-endpoints)
7. [Environment Configuration](#environment-configuration)
8. [Database Setup](#database-setup)
9. [Development Workflow](#development-workflow)
10. [Deployment](#deployment)
11. [Future Enhancements](#future-enhancements)

---

## Project Overview

**SalesTrackr** is a full-stack field sales tracking application designed for mobile-first use by field sales representatives. It manages clients, visits, sales data, depots, training logs, missed orders, and product complaints.

### Key Features
- Client relationship management with geolocation
- Visit tracking with check-in/check-out functionality
- Depot inspection management
- Missed order logging
- Training activity tracking
- Product complaint management
- Mobile-optimized interface for field use
- Real-time data synchronization

---

## Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Cloud NoSQL Database)
- **ODM:** Mongoose
- **Security:** Helmet, CORS
- **Environment:** dotenv for configuration
- **Language:** TypeScript

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** Wouter (lightweight React router)
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Styling:** Tailwind CSS
- **Forms:** React Hook Form + Zod validation
- **Data Fetching:** TanStack Query (React Query v5)
- **Icons:** Lucide React
- **Language:** TypeScript

### Development
- **Package Manager:** npm
- **Dev Server:** tsx (TypeScript execution)
- **Hot Reload:** Vite HMR
- **Hosting:** Replit

---

## Architecture

### Pattern
SalesTrackr follows a **modern full-stack monorepo architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────┐
│                   Frontend (React)              │
│  ┌─────────────┐  ┌─────────────┐             │
│  │   Pages     │  │  Components │             │
│  └─────────────┘  └─────────────┘             │
│  ┌─────────────────────────────────┐           │
│  │     TanStack Query (State)      │           │
│  └─────────────────────────────────┘           │
└─────────────────────────────────────────────────┘
                      ↕ HTTP/REST
┌─────────────────────────────────────────────────┐
│              Backend (Express)                  │
│  ┌─────────────┐  ┌─────────────┐             │
│  │   Routes    │  │  Storage    │             │
│  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────┘
                      ↕ Mongoose
┌─────────────────────────────────────────────────┐
│            MongoDB Atlas (Cloud)                │
│   Users | Clients | Visits | Depots            │
│   Complaints | MissedOrders | TrainingLogs     │
└─────────────────────────────────────────────────┘
```

### Design Principles
1. **Mobile-First:** All interfaces prioritize mobile user experience
2. **Offline-Ready:** Future PWA support for offline functionality
3. **RESTful API:** Clear, predictable API design
4. **Type Safety:** End-to-end TypeScript for reliability
5. **Shared Schemas:** Data models defined once in `shared/schema.ts`
6. **Security First:** Helmet, CORS, and secure session management

---

## File Structure

```
salestrackr/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── App.tsx                  # Main app component with routing
│   │   ├── main.tsx                 # React entry point
│   │   ├── index.css                # Global styles + Tailwind
│   │   ├── components/
│   │   │   └── ui/                  # shadcn UI components
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── form.tsx
│   │   │       ├── input.tsx
│   │   │       └── ... (50+ components)
│   │   ├── lib/
│   │   │   ├── queryClient.ts       # TanStack Query configuration
│   │   │   └── utils.ts             # Utility functions
│   │   ├── hooks/
│   │   │   └── use-toast.ts         # Toast notification hook
│   │   └── pages/                   # Page components (to be created)
│   │       ├── Dashboard.tsx
│   │       ├── ClientList.tsx
│   │       ├── VisitTracking.tsx
│   │       └── ...
│   └── public/                      # Static assets
│
├── server/                          # Backend Express application
│   ├── index.ts                     # Main server file
│   │   └── MongoDB connection
│   │   └── Express middleware setup
│   │   └── Vite integration
│   │   └── Server initialization
│   │
│   ├── routes.ts                    # API route definitions
│   │   └── GET  /                   # API status
│   │   └── GET  /api/health         # Health check
│   │   └── GET  /api/test-db        # Database test
│   │   └── ... (more routes to be added)
│   │
│   ├── storage.ts                   # Storage interface
│   │   └── IStorage interface       # CRUD operations interface
│   │   └── MemStorage class         # In-memory implementation
│   │
│   ├── models/                      # Mongoose data models
│   │   ├── User.ts                  # User/Agent model
│   │   ├── Client.ts                # Client/Customer model
│   │   ├── Depot.ts                 # Depot location model
│   │   ├── Visit.ts                 # Visit tracking model
│   │   ├── MissedOrder.ts           # Missed order model
│   │   ├── TrainingLog.ts           # Training log model
│   │   └── ProductComplaint.ts      # Product complaint model
│   │
│   └── vite.ts                      # Vite dev server integration
│
├── shared/                          # Shared types and schemas
│   └── schema.ts                    # Drizzle schemas + Zod validation
│       └── Data model definitions
│       └── Insert schemas
│       └── Select types
│
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── vite.config.ts                   # Vite build configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── postcss.config.js                # PostCSS configuration
├── design_guidelines.md             # UI/UX design system
├── replit.md                        # Project memory and preferences
└── SalesTracker_overview.md         # This file
```

---

## Data Models

### 1. User (Agent/Admin)
```typescript
{
  _id: ObjectId,
  name: String,              // User's full name
  email: String,             // Unique email address
  password: String,          // Hashed password
  role: 'agent' | 'admin'    // User role
}
```

**Purpose:** Authentication and user management

### 2. Client (Customer)
```typescript
{
  _id: ObjectId,
  name: String,              // Client/business name
  address: String,           // Physical address
  lat: Number,               // Latitude coordinate
  lng: Number,               // Longitude coordinate
  region: String,            // Geographic region
  hasComplaint: Boolean,     // Complaint flag
  complaintNote: String,     // Complaint details
  requestedVisit: Boolean    // Visit request flag
}
```

**Purpose:** Customer relationship management with geolocation

### 3. Depot
```typescript
{
  _id: ObjectId,
  name: String,              // Depot name
  lat: Number,               // Latitude coordinate
  lng: Number,               // Longitude coordinate
  inspection: {
    done: Boolean,           // Inspection completed
    hsFile: Boolean,         // Health & Safety file present
    housekeeping: Number,    // Rating 1-5
    hazLicense: Boolean,     // Hazardous materials license
    stockCounted: Boolean,   // Stock count completed
    notes: String            // Additional notes
  }
}
```

**Purpose:** Depot location and inspection tracking

### 4. Visit
```typescript
{
  _id: ObjectId,
  client: ObjectId,          // Reference to Client
  agent: ObjectId,           // Reference to User
  checkInTime: Date,         // Visit start time
  checkOutTime: Date         // Visit end time (optional)
}
```

**Purpose:** Track field visits to clients

### 5. MissedOrder
```typescript
{
  _id: ObjectId,
  client: ObjectId,          // Reference to Client (optional)
  product: String,           // Product name
  reason: String,            // Reason for missing order
  date: Date                 // When order was missed
}
```

**Purpose:** Log and track missed sales opportunities

### 6. TrainingLog
```typescript
{
  _id: ObjectId,
  agent: ObjectId,           // Reference to User
  description: String,       // Training activity description
  date: Date                 // Training date
}
```

**Purpose:** Track agent training activities

### 7. ProductComplaint
```typescript
{
  _id: ObjectId,
  client: ObjectId,          // Reference to Client (optional)
  product: String,           // Product name
  comment: String,           // Complaint details
  date: Date                 // Complaint date
}
```

**Purpose:** Manage product quality complaints

---

## API Endpoints

### Current Endpoints

#### System
```
GET  /                       # API status check
GET  /api/health             # Health check + DB status
GET  /api/test-db            # Database connection test
```

### Planned API Routes

#### Authentication
```
POST   /api/auth/register    # User registration
POST   /api/auth/login       # User login
POST   /api/auth/logout      # User logout
GET    /api/auth/me          # Get current user
```

#### Clients
```
GET    /api/clients          # List all clients
GET    /api/clients/:id      # Get client by ID
POST   /api/clients          # Create new client
PUT    /api/clients/:id      # Update client
DELETE /api/clients/:id      # Delete client
GET    /api/clients/nearby   # Get clients near location (geospatial)
```

#### Visits
```
GET    /api/visits           # List visits (with filters)
GET    /api/visits/:id       # Get visit by ID
POST   /api/visits/check-in  # Check in to client location
POST   /api/visits/check-out # Check out from client
GET    /api/visits/active    # Get current active visit
GET    /api/visits/history   # Visit history for agent
```

#### Depots
```
GET    /api/depots           # List all depots
GET    /api/depots/:id       # Get depot by ID
POST   /api/depots           # Create depot
PUT    /api/depots/:id       # Update depot
PUT    /api/depots/:id/inspection  # Update inspection data
DELETE /api/depots/:id       # Delete depot
```

#### Missed Orders
```
GET    /api/missed-orders    # List missed orders
GET    /api/missed-orders/:id  # Get missed order by ID
POST   /api/missed-orders    # Log missed order
DELETE /api/missed-orders/:id  # Delete missed order
```

#### Training Logs
```
GET    /api/training         # List training logs
GET    /api/training/:id     # Get training log by ID
POST   /api/training         # Create training log
DELETE /api/training/:id     # Delete training log
```

#### Product Complaints
```
GET    /api/complaints       # List complaints
GET    /api/complaints/:id   # Get complaint by ID
POST   /api/complaints       # Submit complaint
PUT    /api/complaints/:id   # Update complaint
DELETE /api/complaints/:id   # Delete complaint
```

---

## Environment Configuration

### Required Environment Variables

```bash
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/salestrackr?...

# Session Secret (for express-session)
SESSION_SECRET=your-secret-key-here

# Server Configuration
PORT=5000                    # Replit requires port 5000
NODE_ENV=development         # development | production
```

### Replit Secrets
All sensitive data is stored in Replit Secrets:
- `MONGODB_URI` - MongoDB Atlas connection string
- `SESSION_SECRET` - Session encryption key

**Access Secrets:** Use the `ask_secrets` tool when running in Replit Agent

---

## Database Setup

### MongoDB Atlas Configuration

**Cluster:** ClusterForSalesTracker
**Region:** Auto-selected by MongoDB Atlas
**Tier:** M0 Free Tier (512MB storage)
**Database Name:** `salestrackr`

#### Connection Details
```
Username: lpretorius07_bd_user
Cluster: clusterforsalestracker.btsxos0.mongodb.net
Database: salestrackr
```

#### Security Settings
1. **Network Access:** 0.0.0.0/0 (Allow from anywhere - required for Replit)
2. **Database User:** Read and write to any database
3. **Authentication:** SCRAM-SHA-256

#### Important Notes
- **M0 Free Tier Limitations:**
  - Cannot write to `admin` database
  - 512MB storage limit
  - Some admin commands restricted
  - Must specify database name in connection string

- **Connection String Format:**
  ```
  mongodb+srv://username:password@cluster.net/salestrackr?params
                                                 ^^^^^^^^^^
                                            Database name required!
  ```

### Database Connection (server/index.ts)
```typescript
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  await mongoose.connect(mongoURI);
  const dbName = mongoose.connection.db?.databaseName;
  console.log(`✅ MongoDB connected to: ${dbName}`);
};
```

---

## Development Workflow

### Starting the Application

**Single Command:**
```bash
npm run dev
```

This starts:
1. Express backend server on port 5000
2. Vite frontend dev server (proxied through Express)
3. MongoDB connection
4. Hot module reloading

**Workflow Auto-Restart:**
In Replit, the "Start application" workflow runs `npm run dev` and automatically restarts when:
- Package installations occur
- Server files change
- Configuration updates

### Project Scripts

```json
{
  "dev": "NODE_ENV=development tsx server/index.ts",
  "build": "vite build",
  "start": "NODE_ENV=production tsx server/index.ts"
}
```

### Development Best Practices

1. **Type Safety:** Always define types in `shared/schema.ts` first
2. **Storage Interface:** Use `IStorage` for all CRUD operations
3. **Route Validation:** Validate request bodies with Zod schemas
4. **Error Handling:** Use try-catch blocks in route handlers
5. **Mobile-First:** Design for mobile screens first, then desktop
6. **Test Endpoints:** Use `curl` or test tools before building UI

---

## Deployment

### Replit Deployment

**Current Status:** Development mode
**Production Deployment:** Use Replit's "Publish" feature

#### Deployment Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Verify MongoDB connection works
- [ ] Test all API endpoints
- [ ] Verify frontend builds correctly
- [ ] Configure custom domain (optional)
- [ ] Enable HTTPS (automatic on Replit)

#### Production Environment
```bash
NODE_ENV=production
MONGODB_URI=<production-connection-string>
SESSION_SECRET=<strong-secret-key>
```

#### Replit Publishing
1. Click "Publish" button in Replit
2. Application will be available at: `https://<repl-name>.replit.app`
3. TLS/SSL handled automatically
4. Health checks monitored automatically

---

## Future Enhancements

### Phase 1: Core Features (In Progress)
- [ ] Complete REST API for all models
- [ ] User authentication system
- [ ] Client management UI
- [ ] Visit tracking UI
- [ ] Mobile-responsive design

### Phase 2: Advanced Features
- [ ] **Geolocation Integration**
  - Real-time location tracking
  - Distance calculation to clients
  - Route optimization
  - Geofencing for auto check-in/out

- [ ] **Offline Mode (PWA)**
  - Service workers
  - IndexedDB for offline storage
  - Background sync when online
  - Install to home screen

- [ ] **File Uploads**
  - Inspection photos
  - Complaint documentation
  - Cloud storage integration

### Phase 3: Analytics & Reporting
- [ ] Visit statistics dashboard
- [ ] Sales performance metrics
- [ ] Complaint trend analysis
- [ ] Export reports (PDF, CSV)
- [ ] Data visualization with charts

### Phase 4: Real-time Features
- [ ] WebSocket integration
- [ ] Live location sharing
- [ ] Push notifications
- [ ] Real-time visit updates

### Phase 5: Enterprise Features
- [ ] Multi-tenant support
- [ ] Role-based access control (RBAC)
- [ ] Audit logging
- [ ] Advanced search and filtering
- [ ] Integration APIs for third-party systems

---

## Technical Notes

### Port Configuration
**Critical:** Replit only exposes port 5000 externally. All other ports are firewalled.

```typescript
const port = parseInt(process.env.PORT || '5000', 10);
server.listen({ port, host: "0.0.0.0" });
```

### Vite + Express Integration
The application uses a single server for both frontend and backend:
- **Development:** Vite dev server runs through Express middleware
- **Production:** Express serves static built files
- **Benefits:** Single port, no CORS issues, simplified deployment

### Session Management
```typescript
// Planned implementation
import session from 'express-session';
import MongoStore from 'connect-mongo';

app.use(session({
  secret: process.env.SESSION_SECRET,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));
```

### Geolocation Strategy
- **Browser API:** `navigator.geolocation` for client-side location
- **MongoDB:** Geospatial indexes for nearby queries
- **Accuracy:** Balance battery life with precision

---

## Troubleshooting

### Common Issues

**1. MongoDB Connection Fails**
```
Error: Could not connect to any servers
```
**Solution:** Verify IP whitelist (0.0.0.0/0) in MongoDB Atlas Network Access

**2. "Command insert not found"**
```
Error: command insert not found
```
**Solution:** Connection string is using wrong database (e.g., `admin` or `sample_mflix`). Must use `/salestrackr`

**3. Port 5000 Already in Use**
**Solution:** Restart the Replit workspace or kill existing process

**4. Frontend Not Loading**
**Solution:** Vite build may have failed. Check for TypeScript errors in components

### Debug Checklist
- [ ] Check server logs for errors
- [ ] Verify `MONGODB_URI` secret is set correctly
- [ ] Confirm database name in connection string is `salestrackr`
- [ ] Test `/api/health` endpoint for DB connection status
- [ ] Check browser console for frontend errors

---

## Contact & Maintenance

**Project:** SalesTrackr
**Platform:** Replit
**Database:** MongoDB Atlas (ClusterForSalesTracker)
**Created:** October 2025
**Last Updated:** October 30, 2025

### Key Maintenance Tasks
- [ ] Rotate `SESSION_SECRET` periodically
- [ ] Monitor MongoDB Atlas storage usage (M0 = 512MB limit)
- [ ] Update dependencies monthly (`npm update`)
- [ ] Review and optimize slow queries
- [ ] Backup database regularly (MongoDB Atlas automated backups)

---

## Quick Reference Commands

```bash
# Development
npm run dev                  # Start dev server

# Database
curl http://localhost:5000/api/health     # Check DB connection
curl http://localhost:5000/api/test-db    # Test DB write

# Dependencies
npm install <package>        # Install package (use Replit packager tool)

# Testing
curl -X POST http://localhost:5000/api/... -H "Content-Type: application/json" -d '{...}'
```

---

**End of Document**

*This overview should be updated as the application evolves. Keep it synchronized with actual implementation.*
