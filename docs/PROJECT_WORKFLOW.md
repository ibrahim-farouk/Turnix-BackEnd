# 🚀 Turnix - Project Workflow
## Smart Queue Management System

# 🎯 فكرة المشروع

Turnix هو نظام لإدارة طوابير الانتظار يسمح للعملاء بحجز دورهم أونلاين قبل الوصول إلى الفرع، كما يسمح للموظفين بإدارة الطابور لحظة بلحظة، ويوفر للإدارة تقارير وإعدادات النظام.

يوجد نوعان من المستخدمين:

1. Customer (بدون Login)
2. Admin / Employee (Login)

---

# 👥 User Roles

## 1- Customer

لا يحتاج إلى إنشاء حساب أو تسجيل دخول.

يمكنه:

- الدخول للموقع
- اختيار الفرع
- اختيار الخدمة
- إدخال الاسم ورقم الهاتف
- حجز دوره
- استلام رقم التذكرة
- متابعة دوره مباشرة

---

## 2- Employee

يسجل دخول باستخدام البريد الإلكتروني وكلمة المرور.

يمكنه:

- مشاهدة الطابور الحالي
- استدعاء العميل التالي
- تخطي العميل
- اعتبار العميل No Show
- إنهاء الخدمة

لا يستطيع:

- إدارة الموظفين
- تعديل الإعدادات
- رؤية التقارير الإدارية

---

## 3- Admin

يمتلك جميع صلاحيات الموظف بالإضافة إلى:

- إدارة الموظفين
- إضافة موظفين
- تعديل بيانات الموظفين
- حذف الموظفين
- عرض التقارير
- تعديل إعدادات النظام

---

# 🔄 Project Workflow

## أولاً: Customer Flow

Landing Page

↓

يقرأ فكرة النظام

↓

يضغط Join Queue

↓

يختار:

- Branch
- Service

↓

يدخل:

- Full Name
- Phone Number

↓

يضغط Join Queue

↓

يقوم النظام بإنشاء:

- Ticket Number
- Queue Position
- Estimated Waiting Time
- QR / Reference ID

↓

ينتقل إلى

Queue Tracking

↓

يتابع:

- Current Serving
- People Ahead
- Estimated Waiting Time
- Ticket Status

↓

عندما يحين دوره

↓

يتوجه إلى الشباك

↓

يقوم الموظف بإنهاء الخدمة

↓

تنتهي الرحلة.

---

# 👨‍💼 Employee Workflow

Login

↓

Workspace

↓

يرى:

- Current Serving
- Waiting Queue
- Statistics

↓

يختار أول عميل

↓

Call Next

↓

العميل يصبح:

Serving

↓

بعد انتهاء الخدمة

↓

Complete Service

↓

التذكرة تصبح Completed

↓

النظام يستدعي العميل التالي.

---

إذا لم يحضر العميل:

↓

Mark as No Show

↓

ينتقل للعميل التالي.

---

# 👨‍💻 Admin Workflow

Login

↓

Workspace

↓

يمكنه متابعة الطابور مثل الموظف.

ثم يستطيع الانتقال إلى:

Employees

↓

- Add Employee
- Edit Employee
- Delete Employee
- View Employee

---

Reports

↓

مشاهدة:

- Customers Served
- Average Waiting Time
- Average Service Time
- Skipped Tickets

ويمكنه تصدير التقرير.

---

Settings

↓

تعديل:

- Queue Name
- Default Service Time
- Maximum Waiting Capacity
- Password

---

Profile

↓

تعديل بياناته الشخصية.

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

# 📌 Queue Status Flow

Waiting

↓

Called

↓

Serving

↓

Completed

أو

Waiting

↓

No Show

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

Called

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

سيتم استخدام نفس الـ Components في جميع الصفحات:

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

# ✅ النهاية

بهذا الـ Workflow يكون مسار المشروع كاملاً كالتالي:

Customer → يحجز دوره → يتابع التذكرة → يصل دوره → يحصل على الخدمة.

Employee → يدير الطابور → يستدعي العملاء → ينهي الخدمات.

Admin → يدير النظام بالكامل → الموظفين → التقارير → الإعدادات.

