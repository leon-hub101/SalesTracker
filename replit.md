# SalesTrackr - Project Documentation

## Overview

SalesTrackr is a mobile-first field sales tracking application designed for sales representatives to manage client relationships, track visits, log training activities, and handle product complaints. The application provides real-time data synchronization with a focus on quick data entry and efficient workflows optimized for field use.

**Key Features:**
- Client relationship management with geolocation
- Visit tracking with check-in/check-out functionality
- Depot inspection management
- Missed order logging
- Training activity tracking
- Product complaint management
- Mobile-optimized interface for field operations

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool for fast development and optimized production builds
- Wouter for lightweight client-side routing

**UI Component System:**
- shadcn/ui components built on Radix UI primitives for accessible, customizable components
- Tailwind CSS for utility-first styling with custom design tokens
- Design system based on Material Design principles with CRM references (Salesforce Mobile, HubSpot)
- "New York" style variant for shadcn components

**State Management:**
- TanStack Query (React Query) for server state management, caching, and synchronization
- React Context API for authentication state (AuthContext)
- Session-based authentication with express-session

**Design Principles:**
- Mobile-first responsive design
- Speed-optimized for minimal clicks
- Data-dense interfaces with clear visual hierarchy
- Thumb-friendly interactions for field use

### Backend Architecture

**Runtime & Framework:**
- Node.js with Express.js for the REST API server
- TypeScript for type-safe backend development
- Session-based authentication using express-session

**API Design:**
- RESTful endpoints organized by resource
- JSON request/response format
- Authentication middleware (requireAuth, requireAdmin) for protected routes
- Zod schemas for request validation

**Authentication & Authorization:**
- bcrypt for password hashing
- Session-based authentication with user roles ('agent' | 'admin')
- Role-based access control via middleware

**Security:**
- Helmet.js for security headers
- CORS enabled for cross-origin requests
- Input validation using Zod schemas

### Data Storage

**Database:**
- MongoDB Atlas (cloud-hosted NoSQL database)
- Mongoose ODM for schema definition and data modeling

**Data Models:**
- User: Authentication and role management
- Client: Customer data with geolocation (lat/lng)
- Visit: Check-in/check-out tracking linked to clients and agents
- Depot: Location data with inspection details
- MissedOrder: Product orders that didn't complete
- TrainingLog: Agent training activity records
- ProductComplaint: Customer complaints with product details

**Schema Design:**
- Document references using MongoDB ObjectIds
- Timestamps automatically managed by Mongoose
- Embedded subdocuments for complex nested data (e.g., depot inspections)

### Project Structure

**Monorepo Organization:**
- `/client` - React frontend application
- `/server` - Express backend API
- `/shared` - Shared TypeScript schemas and types
- `/migrations` - Database migration files (Drizzle config present but using Mongoose)

**Configuration Files:**
- TypeScript configuration with path aliases (@/, @shared/)
- Vite configuration with custom aliases and plugins
- Tailwind with extensive custom theming
- PostCSS for CSS processing

## External Dependencies

### Database Services
- **MongoDB Atlas**: Cloud-hosted MongoDB database for data persistence
  - Connection string stored in MONGODB_URI environment variable
  - Supports geolocation queries for client and depot locations

### NPM Packages

**Frontend Core:**
- @tanstack/react-query - Server state management
- wouter - Lightweight routing
- react-hook-form - Form state management
- @hookform/resolvers - Zod integration for forms

**UI Components:**
- @radix-ui/* - Accessible component primitives (20+ components)
- class-variance-authority - Component variant management
- tailwindcss - Utility-first CSS framework
- clsx & tailwind-merge - Conditional class name handling

**Backend Core:**
- express - Web framework
- mongoose - MongoDB ODM
- bcrypt - Password hashing
- express-session - Session management
- dotenv - Environment variable management
- cors - Cross-origin resource sharing
- helmet - Security headers

**Development Tools:**
- TypeScript - Type safety across the stack
- Vite - Frontend build tool and dev server
- tsx - TypeScript execution for development
- esbuild - Backend bundling for production
- drizzle-kit - Database toolkit (configured but using Mongoose)

**Validation:**
- zod - Schema validation for API requests and forms

### Third-Party Integrations
- Google Fonts (Inter, JetBrains Mono, DM Sans, Fira Code, Geist Mono)
- Replit development plugins (@replit/vite-plugin-*)

### Environment Variables
- `MONGODB_URI` - MongoDB Atlas connection string
- `NODE_ENV` - Environment (development/production)
- `DATABASE_URL` - Alternative database URL (Drizzle config, not actively used)