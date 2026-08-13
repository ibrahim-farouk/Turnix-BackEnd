# Turnix — Socket.IO Real-Time Layer

> This document describes the **actual implemented** Socket.IO integration in the Turnix backend. It is the contract for frontend integration.

---

## Overview

Socket.IO is an **additive real-time notification layer** running on the same HTTP server as the REST API. It does **not** replace any REST endpoints.

- All mutations remain REST-only (`PATCH /api/workspace/tickets/...`)
- After a successful DB write in the service layer, events are emitted to the workspace room
- Business logic stays in services; Socket.IO only pushes the result

---

## Connection & Authentication

### Handshake

```js
const socket = io(API_BASE, {
  auth: { token: localStorage.getItem("accessToken") },
  transports: ["websocket", "polling"]
});
```

- Uses the **same JWT** issued by `POST /api/auth/login`
- Token is passed in `socket.handshake.auth.token`
- No cookies, no separate auth endpoint

### Server Verification (in `src/socket/socket-auth.middleware.js`)

1. Extract token from `handshake.auth.token`
2. `jwt.verify(token, env.jwtSecret)` — same secret as REST
3. `User.findById(decoded.userId)` — same User model
4. Check `user.status === "ACTIVE"` — same as REST middleware
5. On success, populate `socket.data`:

```js
socket.data.userId   = user._id.toString();
socket.data.role     = user.role;        // "ADMIN" | "EMPLOYEE"
socket.data.branch   = user.branch?.toString()  || null;
socket.data.service  = user.service?.toString() || null;
```

### Rejection Reasons

| Condition | `connect_error` message |
|---|---|
| No token | `UNAUTHORIZED` |
| Invalid signature | `UNAUTHORIZED` |
| Expired token | `UNAUTHORIZED` |
| User not found | `UNAUTHORIZED` |
| User status !== ACTIVE | `FORBIDDEN` |
| Other server error | `INTERNAL_SERVER_ERROR` |

Frontend should treat any `connect_error` as "re-authenticate via REST, then retry".

---

## Rooms

### Workspace Room

**Pattern:** `branch:{branchId}:service:{serviceId}`

- One room per queue (branch + service combination)
- Joined automatically on connection by `joinWorkspace(socket, branch, service)`
- Only users whose `socket.data.branch` and `socket.data.service` match are joined
- ADMIN without branch/service assignment: connects but joins **no room** (receives nothing)
- Room name is **always derived from server-side `socket.data`** — never from client query

### Ticket Room (`ticket:{ticketId}`)

**Not implemented in MVP.** Customers track via REST polling (`GET /api/tickets/:id/track` with `X-Guest-Token`).

---

## Events (MVP Contract)

All event names are namespaced (`domain:verb`). All payloads follow the same field shapes as the corresponding REST responses.

### `ticket:created`

**Trigger:** `POST /api/tickets` → `ticket.service.joinQueue` after `createTicket`

**Room:** `branch:{branchId}:service:{serviceId}`

**Payload:**

```json
{
  "ticket": {
    "id": "TICKET_ID",
    "ticketNumber": "A106",
    "status": "WAITING",
    "customerName": "Sara Ali",
    "service": { "id": "SERVICE_ID", "name": "Dentistry" },
    "queuePosition": 3,
    "peopleAhead": 2,
    "estimatedWait": 30,
    "joinedAt": "2026-08-13T10:22:11.000Z"
  }
}
```

### `ticket:called`

**Trigger:** `PATCH /api/workspace/tickets/:id/call` → `workspace.service.callCustomer`

**Room:** `branch:{branchId}:service:{serviceId}`

**Payload:**

```json
{
  "ticket": {
    "id": "TICKET_ID",
    "ticketNumber": "A105",
    "status": "SERVING",
    "counterNumber": 2,
    "calledAt": "2026-08-13T10:25:00.000Z"
  },
  "previousTicketId": "PREVIOUS_TICKET_ID"
}
```

`previousTicketId` is the ticket that was just completed/skipped/cancelled (if applicable), so the frontend can reconcile.

### `ticket:completed`

**Trigger:** `PATCH /api/workspace/tickets/:id/complete`

**Payload:**

```json
{ "ticket": { "id": "...", "ticketNumber": "A104", "status": "COMPLETED", "completedAt": "..." } }
```

### `ticket:skipped`

**Trigger:** `PATCH /api/workspace/tickets/:id/skip`

**Payload:**

```json
{ "ticket": { "id": "...", "ticketNumber": "A103", "status": "SKIPPED" } }
```

### `ticket:cancelled`

**Trigger:** `PATCH /api/workspace/tickets/:id/cancel`

**Payload:**

```json
{ "ticket": { "id": "...", "ticketNumber": "A107", "status": "CANCELLED" } }
```

### `workspace:stats`

**Trigger:** After **any** successful ticket mutation

**Payload:**

```json
{
  "statistics": {
    "waiting": 5,
    "serving": 1,
    "completed": 12,
    "avgWait": 14
  }
}
```

---

## Frontend Integration Guide

### Connection

```js
const socket = io("http://localhost:5000", {
  auth: { token: localStorage.getItem("accessToken") },
  transports: ["websocket", "polling"]
});

socket.on("connect", () => console.log("Socket connected:", socket.id));
socket.on("connect_error", (err) => {
  if (err.message.includes("UNAUTHORIZED") || err.message.includes("FORBIDDEN")) {
    // Token invalid/expired — re-login
    redirectToLogin();
  }
});
```

### Event Handlers

```js
socket.on("ticket:created", ({ ticket }) => {
  // Insert ticket into waiting queue at ticket.queuePosition
  waitingQueue.splice(ticket.queuePosition - 1, 0, ticket);
  // If not using workspace:stats, increment waiting count
});

socket.on("ticket:called", ({ ticket, previousTicketId }) => {
  // Move previousTicketId out of currentServing if it matches
  if (previousTicketId && currentServing?.id === previousTicketId) {
    currentServing = null;
  }
  // Set new current serving
  currentServing = ticket;
  // Remove from waiting queue (it was at position 1)
  waitingQueue.shift();
  // Decrement queuePosition of remaining waiting tickets by 1
  waitingQueue.forEach(t => t.queuePosition--);
});

socket.on("ticket:completed", ({ ticket }) => {
  if (currentServing?.id === ticket.id) currentServing = null;
  // If somehow still in waiting queue, remove
  waitingQueue = waitingQueue.filter(t => t.id !== ticket.id);
});

socket.on("ticket:skipped", ({ ticket }) => {
  if (currentServing?.id === ticket.id) currentServing = null;
  waitingQueue = waitingQueue.filter(t => t.id !== ticket.id);
});

socket.on("ticket:cancelled", ({ ticket }) => {
  if (currentServing?.id === ticket.id) currentServing = null;
  waitingQueue = waitingQueue.filter(t => t.id !== ticket.id);
});

socket.on("workspace:stats", ({ statistics }) => {
  // Replace KPI strip
  waitingCount = statistics.waiting;
  servingCount = statistics.serving;
  completedCount = statistics.completed;
  avgWait = statistics.avgWait;
});
```

### Important Notes

- `workspace:stats` may arrive **after** the `ticket:*` event (tens of ms). Frontend should optimistically update on `ticket:*` and reconcile on `workspace:stats` (or just use REST as next source of truth).
- No `ticket:position-changed` event — frontend decrements locally on `ticket:called`.
- No `workspace:queue-updated` event — frontend reconstructs from deltas.
- Customers do **not** receive these events — they use `GET /api/tickets/:id/track` with polling.

---

## Security

| Measure | Implementation |
|---|---|
| JWT reuse | Same `env.jwtSecret`, same `User` model, same `ACTIVE` check |
| No second auth system | Single token source |
| Room isolation | Server derives room from `socket.data.branch/service` — client cannot override |
| Inactive users | Rejected at handshake (`FORBIDDEN`) |
| Expired/invalid tokens | Rejected at handshake (`UNAUTHORIZED`) |
| No sensitive fields emitted | Never includes `guestTokenHash`, `password`, `calledBy` (raw), JWT secrets |
| No mutating client events | MVP has no `socket.on(...)` handlers for mutations |

---

## Architecture

```
Frontend (Employee)
    │
    ├── REST  ──────────→ Express app (unchanged)
    │                        ↓
    │                     services (unchanged)
    │                        ↓
    │                     MongoDB
    │
    └── Socket.IO  ─────→ Socket.IO Server (same http.Server)
                              │
                              ├── socketAuth middleware (JWT)
                              ├── joinWorkspace → branch:{b}:service:{s}
                              └── emit from services (after DB write)
```

### File Structure

```
src/
├── server.js                    # http.createServer + initSocketServer
├── socket/
│   ├── index.js                 # initSocketServer(httpServer)
│   ├── io-registry.js           # setIO/getIO singleton
│   ├── socket-auth.middleware.js# JWT verification
│   ├── rooms.js                 # workspaceRoom() + joinWorkspace()
│   ├── stats.js                 # getWorkspaceStats() (repo aggregates)
│   └── emit.js                  # typed emit helpers
├── modules/
│   ├── tickets/
│   │   └── ticket.service.js    # emitTicketCreated + emitWorkspaceStats
│   └── workspace/
│       └── workspace.service.js # emitTicket* + emitWorkspaceStats
```

### Emission Points (Service Layer)

| Service | Function | Emits |
|---|---|---|
| `ticket.service` | `joinQueue` | `ticket:created`, `workspace:stats` |
| `workspace.service` | `callCustomer` | `ticket:called`, `workspace:stats` |
| `workspace.service` | `completeService` | `ticket:completed`, `workspace:stats` |
| `workspace.service` | `skipCustomer` | `ticket:skipped`, `workspace:stats` |
| `workspace.service` | `cancelService` | `ticket:cancelled`, `workspace:stats` |

- Emits are **fire-and-forget** (`.catch(() => {})`) — socket errors never affect REST response
- Emission happens **after** successful DB write, before `return`
- Failed operations throw `AppError` — no emit occurs

---

## Graceful Shutdown

```js
// src/server.js
const shutdown = async (signal) => {
  if (io) await new Promise(r => io.close(r));   // closes WS connections
  if (server) await new Promise(r => server.close(r)); // closes HTTP
  await disconnectMongo();
  process.exit(0);
};
```

`io.close()` is called before `server.close()` and `disconnectMongo()`.

---

## Testing

No automated Socket.IO tests exist in the current project. Manual verification steps:

1. Start server (`npm run dev`)
2. Connect two socket clients with valid employee tokens (same branch+service)
3. Call `POST /api/tickets` → both receive `ticket:created` + `workspace:stats`
4. Call `PATCH /api/workspace/tickets/:id/call` → both receive `ticket:called` + `workspace:stats`
4. Call `PATCH .../complete` → both receive `ticket:completed` + `workspace:stats`
5. Connect client from different branch+service → receives nothing
6. Connect with invalid/expired token → `connect_error`

---

## What Is NOT In MVP

- Authenticated customer sockets (`ticket:{ticketId}` rooms)
- `ticket:position-changed` events
- `workspace:queue-updated` (full queue broadcast)
- Redis adapter / horizontal scaling
- Client-to-server mutating events

---

## Environment Variables

No new variables required. Socket.IO reuses:

- `JWT_SECRET` — from `env.jwtSecret`
- `CLIENT_ORIGIN` — for CORS (`env.clientOrigin`)
- `MONGO_URI`, `PORT`, etc. — unchanged

---

## Dependencies

```json
"socket.io": "^4.8.3"
```

**Not installed** (intentionally):
- `socket.io-client` (frontend only)
- `socket.io-redis`
- `@socket.io/cluster-adapter`

---

## Swagger/OpenAPI

Socket.IO events are **not** documented in the OpenAPI spec (Swagger cannot represent WebSocket events meaningfully). The REST OpenAPI remains correct. This document serves as the Socket.IO contract.