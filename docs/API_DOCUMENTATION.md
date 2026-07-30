<div dir="rtl" align="right">

# Turnix – API Documentation

## MVP API Contract

هذا الملف هو الـAPI Contract بين الـFrontend والـBackend في Turnix MVP.

أي تغيير في:
- Endpoint
- Request Body
- Response Structure
- Field Name
- Status

يجب الاتفاق عليه بين الـFrontend والـBackend قبل تنفيذه.

Base URL:

`/api`

---

# 1. General Response Format

جميع الـResponses تتبع نفس الشكل.

## Success

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

## Error

```json
{
  "success": false,
  "message": "Something went wrong",
  "errors": []
}
```

---

# 2. Authentication

## Login

`POST /api/auth/login`

Access:
- ADMIN
- EMPLOYEE

### Request

```json
{
  "email": "employee@turnix.com",
  "password": "12345678",
  "rememberMe": false
}

`rememberMe` اختيارية، والقيمة الافتراضية لها `false`.

- rememberMe = false → JWT expires in 10h
- rememberMe = true → JWT expires in 30d

```

### Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "JWT_TOKEN",
    "user": {
      "id": "USER_ID",
      "employeeId": "EMP-001",
      "fullName": "Ahmed Mohamed",
      "email": "employee@turnix.com",
      "role": "EMPLOYEE",
      "branch": {
        "id": "BRANCH_ID",
        "name": "Mansoura"
      },
      "service": {
        "id": "SERVICE_ID",
        "name": "Dentistry"
      },
      "counterNumber": 3
    }
  }
}
```

بالنسبة للـAdmin:

```json
{
  "role": "ADMIN"
}
```

الـAdmin غير مرتبط بـBranch أو Service محددة.

---

# 3. Branches

## Get All Branches

`GET /api/branches`

Access:
- Public
- ADMIN

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "BRANCH_ID_1",
      "name": "Mansoura"
    },
    {
      "id": "BRANCH_ID_2",
      "name": "Cairo"
    }
  ]
}
```

لا يوجد Add / Edit / Delete Branch في الـMVP.

---

# 4. Services

## Get Services By Branch

`GET /api/branches/:branchId/services`

Access:
- Public
- ADMIN

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "SERVICE_ID_1",
      "name": "Dentistry",
      "prefix": "A"
    },
    {
      "id": "SERVICE_ID_2",
      "name": "Internal Medicine",
      "prefix": "B"
    },
    {
      "id": "SERVICE_ID_3",
      "name": "ENT",
      "prefix": "C"
    }
  ]
}
```

مثال الـServices:

- Dentistry → A
- Internal Medicine → B
- ENT → C
- Ophthalmology → D
- Pediatrics → E

لا يوجد Add / Edit / Delete Service في الـMVP.

---

# 5. Join Queue

## Create Ticket

`POST /api/tickets`

Access:
- Public

### Request

```json
{
  "customerName": "Mohamed Ali",
  "customerPhone": "01012345678",
  "branchId": "BRANCH_ID",
  "serviceId": "SERVICE_ID"
}
```

### Response

```json
{
  "success": true,
  "message": "Ticket created successfully",
  "data": {
    "ticketId": "TICKET_ID",
    "ticketNumber": "A103",
    "status": "WAITING",
    "queuePosition": 3,
    "peopleAhead": 2,
    "estimatedWait": 30,
    "branch": {
      "id": "BRANCH_ID",
      "name": "Mansoura"
    },
    "service": {
      "id": "SERVICE_ID",
      "name": "Dentistry"
    },
    "joinedAt": "2026-07-24T14:20:00Z"
  }
}
```

الـTicket Number يتم إنشاؤه من الـBackend.

كل Queue مستقلة حسب:

`Branch + Service`

مثال:

```text
Mansoura + Dentistry

A101
A102
A103
```

---

# 6. Queue Calculation

الـBackend هو المسؤول بالكامل عن حساب:

- Queue Position
- People Ahead
- Estimated Wait

الحساب يتم داخل نفس:

`Branch + Service`

ولا يتم احتساب Tickets الخاصة بـServices أخرى.

## Estimated Wait

```text
Estimated Wait = People Ahead × Default Service Time
```

مثال إذا كان:

`Default Service Time = 15 minutes`

```text
A101 → People Ahead: 0 → Estimated Wait: 0
A102 → People Ahead: 1 → Estimated Wait: 15
A103 → People Ahead: 2 → Estimated Wait: 30
A104 → People Ahead: 3 → Estimated Wait: 45
```

الـFrontend لا يقوم بهذه الحسابات.

---

# 7. Queue Tracking

## Track Ticket

`GET /api/tickets/:ticketId/track`

Access:
- Public

يستخدم الـFrontend هذا Endpoint في Polling كل 5–10 ثوانٍ.

### Response – WAITING

```json
{
  "success": true,
  "data": {
    "ticketId": "TICKET_ID",
    "ticketNumber": "A103",
    "status": "WAITING",
    "queuePosition": 3,
    "peopleAhead": 2,
    "estimatedWait": 30,
    "currentServing": "A101",
    "counterNumber": null,
    "branch": {
      "id": "BRANCH_ID",
      "name": "Mansoura"
    },
    "service": {
      "id": "SERVICE_ID",
      "name": "Dentistry"
    }
  }
}
```

### Response – SERVING

```json
{
  "success": true,
  "data": {
    "ticketId": "TICKET_ID",
    "ticketNumber": "A103",
    "status": "SERVING",
    "queuePosition": 0,
    "peopleAhead": 0,
    "estimatedWait": 0,
    "currentServing": "A103",
    "counterNumber": 3,
    "branch": {
      "id": "BRANCH_ID",
      "name": "Mansoura"
    },
    "service": {
      "id": "SERVICE_ID",
      "name": "Dentistry"
    }
  }
}
```

عند:

- COMPLETED
- SKIPPED
- CANCELLED

الـFrontend يوقف Polling.

---

# 8. Ticket Status

الـStatus المسموحة فقط:

```text
WAITING
SERVING
COMPLETED
SKIPPED
CANCELLED
```

الـTransitions المسموحة:

```text
WAITING
   ↓
SERVING
   ↓
COMPLETED
```

ومن SERVING يمكن أيضاً:

```text
SERVING → SKIPPED
SERVING → CANCELLED
```

`Almost Your Turn` ليست Backend Status.

---

# 9. Workspace – Employee

## Get Employee Workspace

`GET /api/workspace`

Access:
- EMPLOYEE

الـBackend يحدد تلقائياً:

- Branch
- Service

من المستخدم المسجل.

الـFrontend لا يرسل `branchId` أو `serviceId`.

### Response

```json
{
  "success": true,
  "data": {
    "branch": {
      "id": "BRANCH_ID",
      "name": "Mansoura"
    },
    "service": {
      "id": "SERVICE_ID",
      "name": "Dentistry"
    },
    "statistics": {
      "waiting": 4,
      "serving": 1,
      "completed": 12,
      "avgWait": 18
    },
    "currentServing": {
      "id": "TICKET_ID",
      "ticketNumber": "A101",
      "customerName": "Ahmed Ali",
      "customerPhone": "01012345678",
      "joinedAt": "2026-07-24T14:00:00Z",
      "status": "SERVING",
      "counterNumber": 3
    },
    "waitingQueue": [
      {
        "id": "TICKET_ID",
        "ticketNumber": "A102",
        "customerName": "Mohamed Ali",
        "customerPhone": "01098765432",
        "queuePosition": 1,
        "estimatedWait": 15,
        "joinedAt": "2026-07-24T14:10:00Z",
        "status": "WAITING"
      }
    ]
  }
}
```

---

# 10. Workspace – Admin

## Get Admin Workspace

`GET /api/admin/workspace?branchId=BRANCH_ID&serviceId=SERVICE_ID`

Access:
- ADMIN

الـAdmin يحدد Branch وService من الـFrontend.

### Response

نفس Structure الخاص بـEmployee Workspace.

الفرق أن الـAdmin يستطيع اختيار أي Branch وأي Service.

---

# 11. Ticket Details

## Get Ticket Details

`GET /api/tickets/:ticketId`

Access:
- ADMIN
- EMPLOYEE

### Response

```json
{
  "success": true,
  "data": {
    "id": "TICKET_ID",
    "ticketNumber": "A102",
    "customerName": "Mohamed Ali",
    "customerPhone": "01012345678",
    "branch": {
      "id": "BRANCH_ID",
      "name": "Mansoura"
    },
    "service": {
      "id": "SERVICE_ID",
      "name": "Dentistry"
    },
    "joinedAt": "2026-07-24T14:10:00Z",
    "queuePosition": 1,
    "estimatedWait": 15,
    "status": "WAITING"
  }
}
```

الـEmployee لا يستطيع الحصول على Ticket خارج الـBranch والـService الخاصين به.

---

# 12. Call Customer

`PATCH /api/tickets/:ticketId/call`

Access:
- ADMIN
- EMPLOYEE

### Response

```json
{
  "success": true,
  "message": "Customer called successfully",
  "data": {
    "id": "TICKET_ID",
    "ticketNumber": "A102",
    "status": "SERVING",
    "counterNumber": 3
  }
}
```

الـEmployee لا يستطيع Call Ticket خارج الـQueue الخاصة به.

ولا يستطيع Call Customer جديد إذا كان لديه Ticket حالياً في حالة `SERVING`.

---

# 13. Complete Service

`PATCH /api/tickets/:ticketId/complete`

Access:
- ADMIN
- EMPLOYEE

### Response

```json
{
  "success": true,
  "message": "Service completed successfully",
  "data": {
    "id": "TICKET_ID",
    "ticketNumber": "A102",
    "status": "COMPLETED"
  }
}
```

---

# 14. Skip Customer

`PATCH /api/tickets/:ticketId/skip`

Access:
- ADMIN
- EMPLOYEE

### Response

```json
{
  "success": true,
  "message": "Customer skipped successfully",
  "data": {
    "id": "TICKET_ID",
    "ticketNumber": "A102",
    "status": "SKIPPED"
  }
}
```

---

# 15. Cancel Ticket

`PATCH /api/tickets/:ticketId/cancel`

Access:
- ADMIN
- EMPLOYEE

### Response

```json
{
  "success": true,
  "message": "Ticket cancelled successfully",
  "data": {
    "id": "TICKET_ID",
    "ticketNumber": "A102",
    "status": "CANCELLED"
  }
}
```

---

# 16. Employees

## Get Employees

`GET /api/employees?page=1&limit=10&search=&status=&branchId=&serviceId=`

Access:
- ADMIN

### Response

```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "id": "USER_ID",
        "employeeId": "EMP-001",
        "fullName": "Ahmed Mohamed",
        "email": "ahmed@turnix.com",
        "phone": "01012345678",
        "branch": {
          "id": "BRANCH_ID",
          "name": "Mansoura"
        },
        "service": {
          "id": "SERVICE_ID",
          "name": "Dentistry"
        },
        "counterNumber": 3,
        "status": "ACTIVE",
        "lastLogin": "2026-07-24T12:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 24,
      "totalPages": 3
    }
  }
}
```

---

# 17. Add Employee

`POST /api/employees`

Access:
- ADMIN

### Request

```json
{
  "fullName": "Ahmed Mohamed",
  "email": "ahmed@turnix.com",
  "phone": "01012345678",
  "branchId": "BRANCH_ID",
  "serviceId": "SERVICE_ID",
  "counterNumber": 3,
  "password": "12345678"
}
```

`confirmPassword` لا يتم إرساله للـBackend.

### Response

```json
{
  "success": true,
  "message": "Employee added successfully",
  "data": {
    "id": "USER_ID",
    "employeeId": "EMP-025",
    "fullName": "Ahmed Mohamed",
    "email": "ahmed@turnix.com",
    "phone": "01012345678",
    "branch": {
      "id": "BRANCH_ID",
      "name": "Mansoura"
    },
    "service": {
      "id": "SERVICE_ID",
      "name": "Dentistry"
    },
    "counterNumber": 3,
    "status": "ACTIVE"
  }
}
```

---

# 18. View Employee

`GET /api/employees/:employeeId`

Access:
- ADMIN

### Response

```json
{
  "success": true,
  "data": {
    "id": "USER_ID",
    "employeeId": "EMP-001",
    "fullName": "Ahmed Mohamed",
    "email": "ahmed@turnix.com",
    "phone": "01012345678",
    "branch": {
      "id": "BRANCH_ID",
      "name": "Mansoura"
    },
    "service": {
      "id": "SERVICE_ID",
      "name": "Dentistry"
    },
    "counterNumber": 3,
    "status": "ACTIVE",
    "lastLogin": "2026-07-24T12:30:00Z",
    "createdAt": "2026-07-01T10:00:00Z"
  }
}
```

---

# 19. Edit Employee

`PATCH /api/employees/:employeeId`

Access:
- ADMIN

### Request

```json
{
  "fullName": "Ahmed Mohamed",
  "email": "newemail@turnix.com",
  "phone": "01098765432",
  "branchId": "BRANCH_ID",
  "serviceId": "SERVICE_ID",
  "counterNumber": 4
}
```

إذا أراد الـAdmin Reset Password:

```json
{
  "fullName": "Ahmed Mohamed",
  "email": "newemail@turnix.com",
  "phone": "01098765432",
  "branchId": "BRANCH_ID",
  "serviceId": "SERVICE_ID",
  "counterNumber": 4,
  "newPassword": "newPassword123"
}
```

إذا لم يتم إرسال `newPassword` لا يتم تغيير Password.

---

# 20. Remove Employee

`DELETE /api/employees/:employeeId`

Access:
- ADMIN

الـBackend يقوم بتعطيل الحساب بدلاً من Hard Delete.

### Response

```json
{
  "success": true,
  "message": "Employee removed successfully",
  "data": null
}
```

---

# 21. Profile

## Get Profile

`GET /api/profile`

Access:
- ADMIN
- EMPLOYEE

### Response – Employee

```json
{
  "success": true,
  "data": {
    "employeeId": "EMP-001",
    "fullName": "Ahmed Mohamed",
    "jobTitle": "Customer Service Agent",
    "email": "ahmed@turnix.com",
    "phone": "01012345678",
    "branch": {
      "id": "BRANCH_ID",
      "name": "Mansoura"
    },
    "service": {
      "id": "SERVICE_ID",
      "name": "Dentistry"
    },
    "role": "EMPLOYEE",
    "lastLogin": "2026-07-24T12:30:00Z"
  }
}
```

بالنسبة للـAdmin يمكن أن تكون:

```json
{
  "branch": null,
  "service": null,
  "role": "ADMIN"
}
```

---

# 22. Update Profile

`PATCH /api/profile`

Access:
- ADMIN
- EMPLOYEE

### Request

```json
{
  "fullName": "Ahmed Mohamed",
  "phone": "01098765432"
}
```

---

# 23. Change Password

`PATCH /api/profile/password`

Access:
- ADMIN
- EMPLOYEE

### Request

```json
{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword123"
}
```

`confirmPassword` يتم التحقق منه في الـFrontend ولا يحتاج للإرسال.

### Response

```json
{
  "success": true,
  "message": "Password updated successfully",
  "data": null
}
```

---

# 24. Settings

## Get Settings

`GET /api/settings`

Access:
- ADMIN

### Response

```json
{
  "success": true,
  "data": {
    "defaultServiceTime": 15
  }
}
```

`defaultServiceTime` بالدقائق.

---

## Update Settings

`PATCH /api/settings`

Access:
- ADMIN

### Request

```json
{
  "defaultServiceTime": 10
}
```

### Response

```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": {
    "defaultServiceTime": 10
  }
}
```

القيمة الجديدة تستخدم في حساب Estimated Wait.

---

# 25. Reports

`GET /api/reports?branchId=&serviceId=&date=2026-07-24`

Access:
- ADMIN

يمكن عدم إرسال `branchId` أو `serviceId` للحصول على البيانات لجميع الفروع أو الخدمات.

### Response

```json
{
  "success": true,
  "data": {
    "statistics": {
      "customersServed": 142,
      "averageWaitTime": 12,
      "averageServiceTime": 8,
      "skippedTickets": 6
    },
    "records": [
      {
        "date": "2026-07-24",
        "served": 42,
        "averageWait": 11,
        "averageService": 8,
        "skipped": 2
      }
    ]
  }
}
```

جميع قيم الوقت بالدقائق.

---

# 26. Naming Convention

جميع JSON Fields تستخدم `camelCase`.

أمثلة:

```text
fullName
rememberMe
customerName
customerPhone
ticketNumber
queuePosition
peopleAhead
estimatedWait
branchId
serviceId
counterNumber
employeeId
jobTitle
lastLogin
defaultServiceTime
joinedAt
createdAt
```

---

# 27. Enums

## User Roles

```text
ADMIN
EMPLOYEE
```

## Employee Status

```text
ACTIVE
INACTIVE
```

## Ticket Status

```text
WAITING
SERVING
COMPLETED
SKIPPED
CANCELLED
```

لا يتم استخدام قيم مختلفة في الـFrontend والـBackend.

---

# 28. HTTP Status Codes

يتم استخدام الـHTTP Status Codes بشكل ثابت:

```text
200 → Request successful
201 → Resource created successfully
400 → Validation / Bad Request
401 → Not authenticated
403 → Not allowed
404 → Resource not found
409 → Conflict مثل Email مستخدم مسبقاً
500 → Server Error
```

---

# 29. Date & Time

جميع الـDate/Time values القادمة من الـBackend تكون بصيغة ISO 8601.

مثال:

```text
2026-07-24T14:20:00Z
```

الـFrontend مسؤول عن تحويلها للشكل المناسب للعرض.

---

# 30. Authentication Header

جميع الـProtected Endpoints ترسل الـJWT:

```text
Authorization: Bearer JWT_TOKEN
```

الـPublic Endpoints لا تحتاج Token:

```text
POST /api/auth/login
GET  /api/branches
GET  /api/branches/:branchId/services
POST /api/tickets
GET  /api/tickets/:ticketId/track
```

---

# 31. Backend Security Rules

الـFrontend لا يعتبر مصدر ثقة للصلاحيات.

الـBackend يجب أن يتحقق من:

- Authentication
- Role
- Employee Branch
- Employee Service
- Ticket Ownership Scope

مثال:

موظف:

`Mansoura → Dentistry`

لا يستطيع تنفيذ Actions على:

`Mansoura → Internal Medicine`

ولا:

`Cairo → Dentistry`

حتى لو قام بتغيير الـRequest يدوياً.

---

# 32. MVP Final Rules

كل Queue يتم تحديدها بواسطة:

`Branch + Service`

كل Employee مرتبط بـ:

`Branch + Service + Counter Number`

الـAdmin مسؤول عن:

`All Branches + All Services`

الـCustomer:

`Select Branch → Select Service → Join Queue`

حساب الانتظار:

`Estimated Wait = People Ahead × Default Service Time`

الـTicket Number يتم إنشاؤه من الـBackend حسب Prefix الخاص بالـService.

لا يوجد في الـMVP:

- Customer Accounts
- Customer Login / Register
- Branch Management
- Service Management
- Counter Management
- Department Management
- Advanced Permissions
- WebSocket / Socket.IO
- Advanced Queue Rules

أي شيء خارج هذا الـContract يعتبر Future Work.

</div>