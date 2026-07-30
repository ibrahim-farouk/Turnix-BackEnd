# Turnix – Frontend Implementation Guide

## MVP Scope

Figma is the primary reference for look and feel.

This file is the primary reference for **behavior** and **business logic**, and for how the Frontend talks to the Backend. See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for the exact request/response contract of every endpoint.

Any data shown in Figma (names, numbers, tickets) is mock data only — real data always comes from the Backend.

The goal is a simple MVP; do not add features beyond what's described in this file.

---

## 1. User Roles

Two kinds of users log in:

### ADMIN
Can access:
- Workspace
- Employees
- Reports
- Settings
- Profile
- Logout

### EMPLOYEE
Can access:
- Workspace
- Profile
- Logout

Cannot access:
- Employees
- Reports
- Settings

Customers never log in or register.

---

## 2. Login

The same Login page is used for both Admin and Employee.

After a successful login, the Backend returns the user data and role, and the Frontend renders the pages appropriate for that role.

All Admin and Employee pages are Protected Routes.

If the user isn't logged in, redirect to Login.

If the session/token expires, log the user out and redirect to Login.

---

## 3. Customer – Join Queue

The customer goes through these steps:

1. Select Branch
2. Select Service
3. Full Name
4. Phone Number
5. Join Queue

Branches and Services come from the Backend — they are never hardcoded.

The Service dropdown is disabled until a Branch is selected.

After selecting a Branch, its Services are loaded (`GET /branches/:branchId/services`).

When the Branch changes:
- The selected Service is reset.
- Services for the new Branch are reloaded.

After a successful Join Queue, the customer is taken to Queue Tracking. **Store the `guestToken` returned by the API** (e.g. in `localStorage`, keyed by ticket ID) — it's returned only once and is required to track the ticket.

---

## 4. Queue Tracking

All data comes entirely from the Backend:

- Ticket Number
- Status
- Queue Position
- People Ahead
- Estimated Wait
- Branch
- Service
- Current Serving
- Counter Number, when relevant

Every request to `GET /tickets/:ticketId/track` must include the `X-Guest-Token` header with the stored guest token. A missing/invalid token returns `401`/`403`.

Ticket statuses used in the MVP:

- WAITING
- SERVING
- COMPLETED
- SKIPPED
- CANCELLED

`Almost Your Turn` is a UI state only, not a status stored in the database.

Queue Tracking updates via polling every 5–10 seconds, without a full page reload.

Once the ticket reaches:
- COMPLETED
- SKIPPED
- CANCELLED

stop polling and show the final state to the customer.

If the ticket doesn't exist (or the guest token doesn't match), show:

`Ticket not found.`

with a button:

`Return Home`

---
## 5. Workspace

Waiting Queue and Statistics come from the Backend.

Every Service within every Branch has its own independent queue.

### EMPLOYEE

The employee only sees and acts on the queue for their own assigned Branch and Service.

Example:

Employee → Mansoura Branch → Dentistry

The employee sees the Dentistry queue in Mansoura only, not other services.

The employee doesn't need a Branch or Service selector — the Backend already knows the branch/service from the logged-in user, and ignores any branch/service sent by the frontend for this role.

### ADMIN

The admin is responsible for all Branches and Services.

In Workspace, the admin has:

- Branch Dropdown
- Service Dropdown

Both are **required** — `GET /workspace` returns `400` for an admin if either `branchId` or `serviceId` is missing, so the workspace view should only be requested once both are selected.

After selecting a Branch, its Services are loaded.

After selecting a Service, the queue for that Branch + Service is shown.

The Service dropdown is disabled until a Branch is selected.

When the Branch changes, the selected Service is reset.

Statistics:

- Waiting
- Serving
- Completed
- Avg Wait

Statistics are scoped to the currently selected queue and come from the Backend.

---

## 6. Workspace Actions

### Call Customer
`WAITING → SERVING`

### Complete Service
`SERVING → COMPLETED`

### Skip Customer
`SERVING → SKIPPED`

### Cancel Ticket
`SERVING → CANCELLED`

After any successful action, refresh:

- Current Serving
- Waiting Queue
- Statistics
- Queue Positions

Don't change ticket state in the Frontend before the Backend request succeeds (no optimistic updates).

An employee cannot call a new customer while they already have a ticket in `SERVING` status — Complete, Skip or Cancel must happen first, otherwise the Backend returns `409`.

---

## 7. Ticket Details Modal

Clicking the Eye icon in the Waiting Queue opens a view-only modal with:

- Ticket Number
- Customer Name
- Phone Number
- Branch
- Service
- Joined At
- Queue Position
- Estimated Wait
- Status

All of this data is already present in the Workspace response (`waitingQueue` array) — **no separate API call is needed** to open this modal.

There is no separate Ticket Details page.

---

## 8. Employees

The Employees page is Admin only.

The table shows:

- Employee Name
- Email
- Phone
- Branch
- Service
- Status
- Last Login
- Actions

In the MVP we use:

- Active
- Inactive

No On Break or real-time presence states.

The list supports filtering by Branch and by Status, plus a text Search on name/employee ID — there is currently no Service filter on this endpoint.

---

## 9. Add Employee Modal

Clicking `+ Add Employee` opens a modal with:

- Full Name
- Job Title
- Email
- Phone Number
- Branch
- Service (Select Service)
- Counter Number
- Password
- Confirm Password

Selecting a Branch loads the Services for that branch.

The Service dropdown is disabled until a Branch is selected.

When the Branch changes, the selected Service is reset.

`confirmPassword` is a frontend-only check and is never sent to the Backend.

On success:
- The modal closes.
- The Employees table refreshes.
- A success message is shown.

The Backend rejects the request with `409` if the chosen Branch + Service pair already has an active employee assigned.

---

## 10. View Employee Modal

Clicking the Eye icon in Employees opens a view-only modal with:

- Employee ID
- Full Name
- Email
- Phone
- Job Title
- Branch
- Service
- Counter Number
- Status
- Last Login
- Member Since

No separate Employee Details page is needed.

---

## 11. Edit Employee Modal

Clicking Edit opens a modal with:

- Full Name
- Phone Number
- Branch
- Service
- Counter Number
- Status (Active / Inactive)

**Email, Job Title and Password are not editable from this modal** — the Backend's update endpoint does not accept them. To change an employee's password, use the separate Reset Password action (section 12).

On success the modal closes and the Employees table refreshes.

When the Branch changes, the current Service selection is reset and Services for the new Branch are loaded. Changing Branch/Service is rejected with `409` if the new pair is already assigned to another active employee.

---

## 12. Reset Employee Password

A dedicated action (e.g. a menu item or button on the employee row) opens a small modal with:

- New Password
- Confirm New Password

`confirmPassword` matching is checked on the Frontend only; only `newPassword` is sent to the Backend (`PATCH /employees/:id/reset-password`). The admin never sees the employee's current password.

On success, show a confirmation message. The employee will be required to use the new password on their next login.

---

## 13. Deactivate Employee

Clicking Delete shows a Confirmation Modal before the action runs.

On success:
- The modal closes.
- The Employees table refreshes.
- The employee can no longer log in.

Don't remove the employee from the Frontend list before the Backend request succeeds — the record isn't actually deleted, it's set to `Inactive`.

---

## 14. Counter Number

To keep the MVP simple, Counter Number is just a field on the Employee record.

Example:

`Employee → Mansoura Branch → Dentistry → Counter 3`

Not needed for now:

- Counter Management
- Add Counter
- Edit Counter
- Counter Page

When calling a customer, the employee's own Counter Number is used automatically.

---

## 15. Reports

The Reports page is Admin only.

It contains:

- Date Filter (exact date, or a text search over the date string)

There is currently **no Branch or Service filter** on Reports — the data is always aggregated across all branches and services. Don't build Branch/Service selectors for this page unless the Backend adds that support.

All statistics and table data come from the Backend based on the active filters.

Export uses `GET /reports/export`, which returns all matching records (no pagination) as JSON — use it to generate a downloadable file (e.g. CSV) on the Frontend.

---

## 16. Profile

### Personal Information
- Full Name
- Job Title
- Email
- Phone Number

### Account Details
- Employee ID
- Branch
- Service
- Role
- Last Login

The user can edit:
- Full Name
- Phone Number

The following fields are Read Only:
- Email
- Job Title
- Employee ID
- Branch
- Service
- Role
- Last Login

The Admin can update an employee's Job Title (but not Email) via Edit Employee.

### Profile Picture

The user can upload/replace their profile picture (`PATCH /profile/picture`, multipart form, field `profileImage`, jpeg/jpg/png/webp, max 5 MB). The previous picture is replaced.

### Security
- Current Password
- New Password
- Confirm Password
- Update Password

The user can change their own password from Profile. `confirmPassword` is sent to and validated by the Backend (must match `newPassword`), in addition to any Frontend check.

---

## 17. Settings

`Default Service Time` is the average expected time to serve one customer.

In the MVP it is global across all Branches and Services — there is no per-branch or per-service override.

Default value is 15 minutes; the Admin can change it from Settings.

The Backend uses this value to compute Estimated Wait.

Not needed for now:
- Branch Management
- Service Management
- Counter Management
- Advanced Settings

---

## 18. Validation

Every form has Frontend validation, and the Backend also validates independently.

Key cases:

- Required Fields
- Valid Email
- Valid Egyptian Phone Number
- Branch Required
- Service Required
- Password Required when Adding an Employee
- Password and Confirm Password must match
- An Email or Phone already in use shows a clear error

Any validation error returned by the Backend must be surfaced to the user (field-level `details` when present).

---

## 19. Loading & Feedback

During any API request, disable the triggering button to prevent double submission.

Examples:

- Sign In → Signing In...
- Add Employee → Adding...
- Save Changes → Saving...
- Join Queue → Joining...
- Complete Service → Processing...

Show a success toast/message after important operations succeed, and a clear error message on failure.

---

## 20. Empty States

Empty Waiting Queue:

`No customers are currently waiting.`

No employees found:

`No employees found.`

No report records:

`No records found.`

No search results:

`No matching results found.`

---

## 21. Pagination & Search

Employees and Reports support:

- Search
- Filters
- Pagination

The Frontend uses the pagination data returned by the Backend and never assumes all data is loaded at once.

---

## 22. API Integration

No Backend data is ever hardcoded.

All of the following come from the Backend:

- Branches
- Services
- Tickets
- Employees
- Reports
- Profile
- Settings
- Statistics

It's best to split the API layer by feature:

- auth
- tickets
- branches
- services
- workspace
- employees
- profile
- settings
- reports

---

## 23. Final Rule

Every button or icon present in Figma must be either:

1. Fully wired to a working function, or
2. Disabled if not currently available, or
3. Removed from the MVP.

Never leave a clickable button or icon with undefined behavior.

---

## Queue Logic

Every Service within every Branch has its own independent queue.

Example:

```
Dentistry:        A101 → A102 → A103
Internal Medicine: B101 → B102 → B103
ENT:               C101 → C102 → C103
```

The ticket number is generated by the Backend, never by the Frontend.

Each Service has its own prefix, e.g.:

- Dentistry → A
- Internal Medicine → B
- ENT → C
- Ophthalmology → D
- Pediatrics → E

Queue Position and People Ahead are computed within the same Branch and same Service only, and reset daily.

Example: if customer A103 is in Dentistry, their position is computed based on Dentistry customers only, not other services.

---

Estimated Wait is computed on the Backend as:

```
Estimated Wait = People Ahead × Default Service Time
```

Example with `Default Service Time = 15 minutes`:

```
Position 1 → 0 minutes
Position 2 → 15 minutes
Position 3 → 30 minutes
Position 4 → 45 minutes
```

The Frontend only displays the Estimated Wait returned by the Backend and never computes it itself.
