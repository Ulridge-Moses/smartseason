# SmartSeason Field Monitoring System

A full stack web application for tracking crop progress across multiple fields during a growing season.

## Demo Credentials

| Role  | Email                      | Password  |
|-------|---------------------------|-----------|
| Admin | admin@smartseason.com      | admin123  |
| Agent | john@smartseason.com       | agent123  |
| Agent | jane@smartseason.com       | agent123  |

## Tech Stack

- **Backend:** Node.js, Express, Prisma ORM v7
- **Frontend:** React, Vite, Tailwind CSS
- **Database:** PostgreSQL (Docker)
- **Auth:** JWT with access and refresh tokens

## Setup Instructions

### Prerequisites

- Node.js v20+
- Docker Desktop

### 1. Clone the repository

```bash
git clone https://github.com/Ulridge-Moses/smartseason.git
cd smartseason
```

### 2. Start the database

```bash
docker compose -f docker/docker-compose.yml up -d
```

### 3. Set up the backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

### 4. Start the backend server

```bash
npm run dev
```

### 5. Set up and start the frontend

```bash
cd ../frontend
npm install
npm run dev
```

### 6. Open the app

Visit `http://localhost:5173` in your browser.

## Design Decisions

### Authentication

JWT-based authentication with two token types:

- **Access token** — short lived (15 minutes), sent in the Authorization header
- **Refresh token** — long lived (7 days), stored in an httpOnly cookie

This approach is stateless — the server stores no session data. The refresh token in an httpOnly cookie is inaccessible to JavaScript, protecting against XSS attacks. When an access token expires, the frontend automatically requests a new one using the refresh token without interrupting the user.

### Role-Based Access Control

Two roles are supported:

- **Admin** — full access to all fields, can create, edit, delete fields and assign agents
- **Agent** — restricted to their assigned fields only, can add observations and update field stages

Role is stored inside the JWT payload. Middleware reads the token on every protected request and enforces access without a database call.

### Field Status Logic

Each field has a computed status derived from its stage and planting date. Status is not stored in the database — it is calculated at query time.

| Condition | Status |
|-----------|--------|
| Stage is HARVESTED | COMPLETED |
| Stage is READY and days since planting > 180 | AT_RISK |
| Stage is PLANTED or GROWING and days since planting > 120 | AT_RISK |
| All other cases | ACTIVE |

The thresholds (120 and 180 days) reflect typical growing cycles for common crops. A field that has not progressed past GROWING after 120 days, or has been READY for an extended period without harvest, is flagged as at risk.

### Database Design

Three core models:

- **User** — stores both admins and agents, distinguished by a role enum
- **Field** — crop fields with stage tracking, assigned to an agent via foreign key
- **FieldUpdate** — immutable log of observations and stage changes made by agents

FieldUpdates are append-only — no updates are edited or deleted. This preserves a full audit trail of field activity.

### Security

- Passwords hashed with bcrypt (10 salt rounds)
- Helmet.js sets secure HTTP headers
- CORS restricted to the frontend origin
- Rate limiting on auth routes
- Input validation on all endpoints

## Assumptions

- A field belongs to exactly one agent at a time
- Admins cannot be assigned fields
- Field status is always computed, never manually set
- The planting date is set once and not changed after creation