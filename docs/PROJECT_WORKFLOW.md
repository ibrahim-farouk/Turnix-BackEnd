# 🚀 Turnix - Project Workflow
## Smart Queue Management System

# 🎯 Project Idea

Turnix is a queue management system that lets customers join a branch's queue online before arriving, lets employees manage the queue in real time, and gives admins system-wide reports and settings.

There are two kinds of users:

1. Customer (no login)
2. Admin / Employee (login required)

---

# 👥 User Roles

## 1. Customer

Does not need to create an account or log in.

Can:

- Visit the site
- Select a branch
- Select a service
- Enter full name and phone number
- Join the queue
- Receive a ticket number
- Track their turn live

---

## 2. Employee

Logs in with email and password.

Can:

- View the current queue
- Call the next customer
- Skip a customer
- Complete a service

Cannot:

- Manage employees
- Change system settings
- View admin reports

---

## 3. Admin

Has all employee permissions, plus:

- Manage employees
- Add employees
- Edit employee data
- Deactivate employees
- View reports
- Change system settings

---

# 🔄 Project Workflow

## 1. Customer Flow

Landing Page

↓

Reads about the system

↓

Clicks Join Queue

↓

Selects:

- Branch
- Service

↓

Enters:

- Full Name
- Phone Number

↓

Clicks Join Queue

↓

The system generates:

- Ticket Number
- Queue Position
- Estimated Waiting Time
- A one-time Guest Token (used to track the ticket)

↓

Moves to

Queue Tracking

↓

Tracks:

- Current Serving
- People Ahead
- Estimated Waiting Time
- Ticket Status

↓

When their turn comes

↓

Goes to the counter

↓

The employee completes the service

↓

The journey ends.

---

# 👨‍💼 Employee Workflow

Login

↓

Workspace

↓

Sees:

- Current Serving
- Waiting Queue
- Statistics

↓

Selects the first customer

↓

Call Next

↓

The customer becomes:

Serving

↓

After the service ends

↓

Complete Service

↓

The ticket becomes Completed

↓

The system is ready to call the next customer.

---

If the customer does not show up:

↓

Skip Customer

↓

The ticket becomes Skipped, and the employee moves to the next customer.

---

# 👨‍💻 Admin Workflow

Login

↓

Workspace

↓

Can monitor the queue like an employee, after selecting a Branch and a Service.

Can also go to:

Employees

↓

- Add Employee
- Edit Employee
- Deactivate Employee
- View Employee

---

Reports

↓

View:

- Customers Served
- Skipped Tickets
- Average Waiting Time
- Average Service Time

And can export the report data.

---

Settings

↓

Change:

- Default Service Time

---

Profile

↓

Update personal information and password.

---

# 📄 Pages Structure

## Public Pages

1. Landing Page
2. Queue Tracking

---

## Authentication

3. Login

---

## Dashboard

4. Workspace
5. Employees (Admin Only)
6. Reports (Admin Only)
7. Settings (Admin Only)
8. Profile

---

# 🔐 Permissions

| Page | Customer | Employee | Admin |
|-------|----------|----------|-------|
| Landing | ✅ | ❌ | ❌ |
| Queue Tracking | ✅ | ❌ | ❌ |
| Login | ❌ | ✅ | ✅ |
| Workspace | ❌ | ✅ | ✅ |
| Employees | ❌ | ❌ | ✅ |
| Reports | ❌ | ❌ | ✅ |
| Settings | ❌ | ❌ | ✅ |
| Profile | ❌ | ✅ | ✅ |

---

# 📌 Ticket Status Flow

Waiting

↓

Serving

↓

Completed

or

Serving

↓

Skipped

or

Serving

↓

Cancelled

---

# 🎫 Customer Journey

Landing Page

↓

Join Queue

↓

Ticket Generated

↓

Queue Tracking

↓

Serving

↓

Completed

---

# 👨‍💼 Employee Journey

Login

↓

Workspace

↓

Call Next

↓

Serving

↓

Complete Service

↓

Next Customer

---

# 👨‍💻 Admin Journey

Login

↓

Workspace

↓

Employees

↓

Reports

↓

Settings

↓

Profile

---

# 🧩 Shared Components

The same components are reused across all pages:

- Navbar
- Sidebar
- Cards
- Buttons
- Inputs
- Select
- Search Bar
- Data Table
- Badge
- Modal
- Toast
- Pagination
- Empty State
- Loading State
- Confirmation Dialog

---

# ✅ Summary

With this workflow, the full project path is:

Customer → joins the queue → tracks the ticket → gets called → receives the service.

Employee → manages the queue → calls customers → completes services.

Admin → manages the whole system → employees → reports → settings.
