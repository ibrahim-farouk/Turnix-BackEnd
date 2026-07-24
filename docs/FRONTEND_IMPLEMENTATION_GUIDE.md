<div dir="rtl" align="right">

# Turnix – Frontend Implementation Guide

## MVP Scope

الـFigma هو المرجع الأساسي للشكل والتصميم.

هذا الملف هو المرجع الأساسي للـBehavior والـBusiness Logic وطريقة تعامل الـFrontend مع الـBackend.

أي بيانات موجودة في Figma مثل الأسماء والأرقام والتذاكر هي Mock Data فقط، والبيانات الحقيقية تأتي من الـBackend.

هدفنا تنفيذ MVP بسيط خلال أسبوع، لذلك لا يتم إضافة Features خارج المذكور في هذا الملف.

---

## 1. User Roles

يوجد نوعان من المستخدمين الذين يقومون بـLogin:

### ADMIN
يمكنه الوصول إلى:
- Workspace
- Employees
- Reports
- Settings
- Profile
- Logout

### EMPLOYEE
يمكنه الوصول إلى:
- Workspace
- Profile
- Logout

ولا يمكنه الوصول إلى:
- Employees
- Reports
- Settings

الـCustomer لا يقوم بعمل Login أو Register.

---

## 2. Login

نفس Login Page تستخدم للـAdmin والـEmployee.

بعد نجاح Login، الـBackend يرجع بيانات المستخدم والـRole، والـFrontend يعرض الصفحات المناسبة حسب الـRole.

كل صفحات الـAdmin والـEmployee تكون Protected Routes.

إذا لم يكن المستخدم مسجل دخول يتم Redirect إلى Login.

إذا انتهت الـSession / Token يتم Logout وإعادة المستخدم إلى Login.

---

## 3. Customer – Join Queue

الـCustomer يقوم بالخطوات التالية:

1. Select Branch
2. Select Service
3. Full Name
4. Phone Number
5. Join Queue

الـBranches والـServices تأتي من الـBackend وليست Hardcoded.

الـService Dropdown يكون Disabled حتى يتم اختيار Branch.

بعد اختيار Branch يتم تحميل الـServices الخاصة به.

عند تغيير Branch:
- يتم Reset للـService المختارة.
- يتم تحميل Services الخاصة بالـBranch الجديد.

بعد نجاح Join Queue ينتقل العميل إلى Queue Tracking.

---

## 4. Queue Tracking

البيانات تأتي بالكامل من الـBackend:

- Ticket Number
- Status
- Queue Position
- People Ahead
- Estimated Wait
- Branch
- Service
- Current Serving
- Counter Number عند الحاجة

الـTicket Status المستخدمة في الـMVP:

- WAITING
- SERVING
- COMPLETED
- SKIPPED
- CANCELLED

`Almost Your Turn` هي UI State فقط وليست Status في الـDatabase.

يتم تحديث Queue Tracking باستخدام Polling كل 5–10 ثوانٍ بدون Reload كامل للصفحة.

عند الوصول إلى:
- COMPLETED
- SKIPPED
- CANCELLED

يتم إيقاف الـPolling وإظهار الحالة النهائية للعميل.

إذا كانت الـTicket غير موجودة يتم عرض:

`Ticket not found.`

مع زر:

`Return Home`

---
## 5. Workspace

الـWaiting Queue والـStatistics تأتي من الـBackend.

كل Service داخل كل Branch لها Queue مستقلة.

### EMPLOYEE

الـEmployee يرى ويتعامل فقط مع Queue الخاصة بالـBranch والـService المرتبط به.

مثال:

Employee → Mansoura Branch → Dentistry

الموظف يرى Dentistry Queue في Mansoura فقط، وليس باقي Services.

لا يحتاج Employee إلى Branch أو Service Selector، لأن الـBackend يعرف الـBranch والـService من المستخدم المسجل.

### ADMIN

الـAdmin مسؤول عن جميع الـBranches والـServices.

في Workspace يكون لديه:

- Branch Dropdown
- Service Dropdown

بعد اختيار Branch يتم تحميل Services الخاصة به.

بعد اختيار Service يتم عرض Queue الخاصة بالـBranch والـService المختارين.

الـService Dropdown يكون Disabled حتى يتم اختيار Branch.

عند تغيير Branch يتم Reset للـService المختارة.

الـStatistics:

- Waiting
- Serving
- Completed
- Avg Wait

الـStatistics تخص الـQueue المحددة حالياً وتأتي من الـBackend.

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

بعد نجاح أي Action يتم تحديث:

- Current Serving
- Waiting Queue
- Statistics
- Queue Positions

لا يتم تغيير الحالة في الـFrontend قبل نجاح Request من الـBackend.

لا يمكن للموظف عمل Call لـCustomer جديد إذا كان لديه Ticket حالياً في حالة SERVING.

يجب أولاً عمل Complete أو Skip أو Cancel.

---

## 7. Ticket Details Modal

عند الضغط على Eye Icon داخل Waiting Queue يفتح Modal للعرض فقط يحتوي على:

- Ticket Number
- Customer Name
- Phone Number
- Branch
- Service
- Joined At
- Queue Position
- Estimated Wait
- Status

لا نحتاج صفحة منفصلة للـTicket Details.

---

## 8. Employees

صفحة Employees خاصة بالـAdmin فقط.

الـTable يحتوي على:

- Employee Name
- Email
- Phone
- Branch
- Service
- Status
- Last Login
- Actions

في الـMVP نستخدم:

- Active
- Inactive

ولا نحتاج On Break أو Real-Time Presence.

---

## 9. Add Employee Modal

عند الضغط على `+ Add Employee` يفتح Modal يحتوي على:

- Full Name
- Email
- Phone Number
- Branch
- Service : [Select Service]
- Counter Number
- Password
- Confirm Password

عند اختيار Branch يتم تحميل Services الخاصة بهذا الـBranch.

الـService Dropdown يكون Disabled حتى يتم اختيار Branch.

عند تغيير Branch يتم Reset للـService المختارة.

بعد النجاح:
- يتم إغلاق الـModal.
- يتم تحديث Employees Table.
- يتم إظهار Success Message.

---

## 10. View Employee Modal

عند الضغط على Eye Icon في Employees يفتح Modal للعرض فقط يحتوي على:

- Employee ID
- Full Name
- Email
- Phone
- Branch
- Service
- Counter Number
- Status
- Last Login
- Member Since

لا نحتاج Employee Details Page منفصلة.

---

## 11. Edit Employee Modal

عند الضغط على Edit يفتح Modal يحتوي على:

- Full Name
- Email
- Phone Number
- Branch
- Service
- Counter Number
- New Password
- Confirm New Password

إذا كانت حقول Password فارغة لا يتم تغيير Password.
الـAdmin لا يرى Password الحالي للموظف، ولكنه يستطيع تعيين Password جديد.
بعد النجاح يتم إغلاق الـModal وتحديث Employees Table.

عند تغيير Branch يتم Reset للـService الحالية وتحميل Services الخاصة بالـBranch الجديد.

---

## 12. Delete Employee

عند الضغط على Delete يظهر Confirmation Modal قبل تنفيذ العملية.

بعد النجاح:
- يتم إغلاق الـModal.
- يتم تحديث Employees Table.
- الموظف لا يستطيع Login مرة أخرى.

لا يتم حذف الموظف من الـFrontend قبل نجاح Request من الـBackend.

---

## 13. Counter Number

لتبسيط الـMVP، الـCounter Number يكون جزءاً من بيانات الـEmployee.

مثال:

`Employee → Mansoura Branch → Dentistry → Counter 3`

لا نحتاج حالياً:

- Counter Management
- Add Counter
- Edit Counter
- Counter Page

عند Call Customer يتم استخدام Counter Number الخاص بالموظف.

---

## 14. Reports

## 14. Reports

صفحة Reports خاصة بالـAdmin.

تحتوي على:

- Branch Filter
- Service Filter
- Date Filter

عند اختيار Branch يتم تحميل Services الخاصة به.

يمكن اختيار:
- All Branches
- All Services
- أو Branch / Service محددة

كل الـStatistics والـTable Data تأتي من الـBackend حسب الـFilters.

إذا كان Export Report لن يتم تنفيذه في الـMVP يتم إزالة الزر.

---

## 15. Profile

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

الحقول التالية تكون Read Only:
- Email
- Job Title
- Employee ID
- Branch
- Service
- Role
- Last Login

يتم إزالة Department.

المستخدم يستطيع تعديل:
- Full Name
- Phone Number

الحقول التالية تكون Read Only:
- Email
- Job Title
- Employee ID
- Branch
- Role
- Last Login

الـAdmin يستطيع تعديل Email الخاص بالموظف من Edit Employee.

### Security
- Current Password
- New Password
- Confirm Password
- Update Password

المستخدم يستطيع تغيير Password الخاص بنفسه من Profile.

---

## 16. Settings

`Default Service Time` هي متوسط الوقت المتوقع لخدمة Customer واحد.

في الـMVP تكون Global لجميع الـBranches والـServices.

القيمة الافتراضية تكون 15 دقيقة، ويمكن للـAdmin تغييرها من Settings.

يستخدم الـBackend هذه القيمة في حساب Estimated Wait.

لا نحتاج حالياً:
- Branch Management
- Service Management
- Counter Management
- Advanced Settings

---

## 17. Validation

كل Forms تحتوي على Frontend Validation، والـBackend يقوم أيضاً بالـValidation.

أهم الحالات:

- Required Fields
- Valid Email
- Valid Phone
- Branch Required
- Service Required
- Password Required عند Add Employee
- Password وConfirm Password يجب أن يتطابقا
- Email المستخدم مسبقاً يظهر Error واضح

أي Validation Error من الـBackend يجب عرضه للمستخدم.

---

## 18. Loading & Feedback

أثناء أي API Request يتم Disable للزر لمنع Double Submission.

أمثلة:

- Sign In → Signing In...
- Add Employee → Adding...
- Save Changes → Saving...
- Join Queue → Joining...
- Complete Service → Processing...

بعد نجاح العمليات المهمة يتم إظهار Success Toast / Message.

وفي حالة الخطأ يتم عرض Error واضح للمستخدم.

---

## 19. Empty States

Waiting Queue فارغة:

`No customers are currently waiting.`

Employees بدون نتائج:

`No employees found.`

Reports بدون نتائج:

`No records found.`

Search بدون نتائج:

`No matching results found.`

---

## 20. Pagination & Search

Employees وWaiting Queue يدعمان:

- Search
- Filters
- Pagination

الـFrontend يتعامل مع الـPagination Data القادمة من الـBackend ولا يفترض أن جميع البيانات محملة مرة واحدة.

---

## 21. API Integration

لا يتم Hardcode لأي Backend Data.

كل البيانات مثل:

- Branches
- Services
- Tickets
- Employees
- Reports
- Profile
- Settings
- Statistics

تأتي من الـBackend.

يفضل فصل API Layer حسب الـFeatures:

- auth
- tickets
- employees
- branches
- services
- reports
- profile
- settings

---

## 22. Final Rule

أي Button أو Icon موجود في الـFigma يجب أن يكون:

1. له Function واضحة ومتنفذة.
2. أو Disabled إذا كان غير متاح.
3. أو يتم إزالته من الـMVP.

لا نترك أي Button أو Icon قابل للضغط بدون Behavior معروف.

---

## Queue Logic

كل Service داخل كل Branch لها Queue مستقلة.

مثال:

Dentistry:
A101 → A102 → A103

Internal Medicine:
B101 → B102 → B103

ENT:
C101 → C102 → C103

الـTicket Number يتم إنشاؤه من الـBackend وليس الـFrontend.

كل Service يكون لها Prefix خاص بها مثل:

- Dentistry → A
- Internal Medicine → B
- ENT → C
- Ophthalmology → D
- Pediatrics → E

Queue Position وPeople Ahead يتم حسابهم داخل نفس الـBranch ونفس الـService فقط.

مثال:

إذا كان العميل A103 في Dentistry، يتم حساب مكانه بناءً على عملاء Dentistry فقط، وليس باقي Services.

---

Estimated Wait يتم حسابه في الـBackend باستخدام:

Estimated Wait = People Ahead × Default Service Time

مثال إذا كان Default Service Time = 15 دقيقة:

Position 1 → 0 دقيقة
Position 2 → 15 دقيقة
Position 3 → 30 دقيقة
Position 4 → 45 دقيقة

الـFrontend يعرض Estimated Wait القادمة من الـBackend ولا يقوم بحسابها بنفسه.

---



</div>