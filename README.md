# 🚀 Turnix — Smart Queue Management System (Backend)

Turnix is a production-ready REST API for managing walk-in queues. Customers join a queue online **without creating an account**, track their turn in real time, while employees manage the daily queue from a dedicated workspace and admins control staff, settings, and performance reports.

---

## ✨ Features

- **Guest ticketing** — customers pick a branch & service, enter name + phone, and receive a ticket number, queue position, and estimated wait. No login required.
- **Secure ticket tracking** — each ticket gets a one-time 64-char guest token (stored hashed, SHA-256) required to track it.
- **Daily queues per service** — ticket numbers (e.g. `A101`) reset daily per branch/service (Africa/Cairo timezone), generated atomically to prevent duplicates.
- **Employee workspace** — live statistics (waiting / serving / completed / avg wait), call next customer, complete, skip, or cancel — with DB-level guarantee of a single SERVING ticket per queue.
- **Admin panel APIs** — employee management (auto-generated `EMP-XXX` IDs, soft delete, password reset), system settings, and daily performance reports with aggregated summaries.
- **Hardened by default** — Helmet, CORS, rate limiting (300 req / 15 min), Mongo sanitization, JWT auth, role-based authorization, bcrypt (cost 12), request IDs.

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js ≥ 18 (ES Modules) |
| Framework | Express 4 |
| Database | MongoDB + Mongoose 8 |
| Auth | JWT (Bearer) + bcryptjs |
| Validation | Zod |
| Uploads | Multer (5 MB, jpeg/jpg/png/webp) |
| API Docs | OpenAPI 3.0 (swagger-jsdoc + swagger-ui-express) |

## 🏗 Architecture

Modular architecture with a strict layering per module:

```
routes → validator (Zod) → controller → service (business logic) → repository (Mongoose)
```

```
src/
├── app.js                  # Express app: security, parsing, docs, routes, error handling
├── server.js               # Entrypoint: config validation, DB connection, graceful shutdown
├── config/env.js           # Environment configuration + validation
├── db/                     # Mongo connection & seed script
├── models/                 # Mongoose models (User, Ticket, Branch, Service, Setting, Counter)
├── common/
│   ├── errors/             # AppError
│   ├── middleware/         # auth, roles, validation, uploads, errors, 404
│   └── utils/              # constants, regex, file URLs
└── modules/
    ├── auth/               # POST /auth/login
    ├── branches/           # GET /branches (public)
    ├── services/           # GET /branches/:branchId/services (public)
    ├── tickets/            # POST /tickets, GET /tickets/:id/track (public, guest token)
    ├── workspace/          # GET /workspace + call/complete/skip/cancel (EMPLOYEE)
    ├── employees/          # CRUD + reset-password (ADMIN)
    ├── profile/            # profile, change-password, picture (authenticated)
    ├── settings/           # GET/PATCH /settings (ADMIN)
    └── reports/            # GET /reports, /reports/export (ADMIN)
```

## 👥 Roles

| Role | Capabilities |
|---|---|
| **Customer** | No account. Join queue, receive ticket + guest token, track turn live. |
| **Employee** | Login. View own branch/service queue, call / complete / skip / cancel tickets. |
| **Admin** | Everything above (workspace view via query filters) + manage employees, settings, reports. |

## 🎫 Ticket Lifecycle

```
WAITING ──call──▶ SERVING ──complete──▶ COMPLETED
                     │──skip──▶ SKIPPED
                     └──cancel─▶ CANCELLED
```

## 🚦 Getting Started

### 1. Prerequisites
- Node.js ≥ 18
- MongoDB instance (local or Atlas)

### 2. Install
```bash
npm install
```

### 3. Configure
```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `PORT` | no (5000) | HTTP port |
| `NODE_ENV` | no | `development` / `production` |
| `MONGO_URI` | **yes** | MongoDB connection string |
| `JWT_SECRET` | **yes (prod)** | Strong secret (≥ 32 chars). Startup fails in production with a weak/missing secret |
| `JWT_EXPIRES_IN` | no (10h) | Token TTL (30d with rememberMe) |
| `CLIENT_ORIGIN` | no | Allowed CORS origin (`*` allows all) |
| `APP_URL` | no | Public backend URL (used for file URLs) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | for seeding | Initial admin credentials |
| `SEED_EMPLOYEE_EMAIL` / `SEED_EMPLOYEE_PASSWORD` | for seeding | Initial employee credentials |

### 4. Seed initial data
```bash
npm run seed
```

### 5. Run
```bash
npm run dev    # development (nodemon)
npm start      # production
```

## 📖 API Documentation

Interactive Swagger UI (OpenAPI 3.0) — the **single source of truth** for the API:

```
http://localhost:5000/api/docs
```

The spec is maintained as modular YAML files under [`docs/paths/`](docs/paths) and [`docs/schemas/`](docs/schemas), assembled by [`docs/swagger.js`](docs/swagger.js). Additional guides: [Project Workflow](docs/PROJECT_WORKFLOW.md) · [Frontend Guide](docs/FRONTEND_IMPLEMENTATION_GUIDE.md).

### Response conventions
- Success (most modules): `{ "success": true, "message": "...", "data": { } }`
- Success (profile / settings / reports): `{ "status": "success", "message": "...", "data": { } }`
- Error (all endpoints): `{ "status": "error", "error": { "code": "...", "message": "...", "details": [ ] } }`

