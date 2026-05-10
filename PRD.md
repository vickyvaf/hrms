HR Management System (HRMS)

=== TECH STACK ===
- Framework: Next.js 16 (App Router)
- Backend: Next.js Route Handlers (src/app/api/...)
- Database: PostgreSQL
- ORM: Prisma
- CSS Framework: Bootstrap 5 + Bootstrap Icons
- Auth: JWT (Bearer token), support "Remember Me"
- Containerization: Docker + Docker Compose
- API Docs: Swagger via next-swagger-doc + swagger-ui-react
- Testing: Jest + ts-jest
- State Management: Use useReducer instead of useState for complex features for example form state, but for simple use cases just use useState.
- Package Manager: Use pnpm

=== FILE NAMING CONVENTIONS ===
All file names use kebab-case.
Example: activity-log.ts, pegawai-form.tsx, auth-middleware.ts

=== FOLDER STRUCTURE ===
hrms/
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── .gitignore
├── jest.config.ts
├── next.config.ts
├── package.json
├── tsconfig.json
├── prisma/
│   ├── schema.prisma
│   └── seeds/
│       └── seed.ts
├── public/
│   └── uploads/           ← employee photos
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx        ← redirect to /login or /dashboard
    │   ├── globals.css
    │   ├── (auth)/
    │   │   └── login/
    │   │       └── page.tsx
    │   ├── (dashboard)/
    │   │   ├── layout.tsx
    │   │   ├── dashboard/page.tsx
    │   │   ├── users/
    │   │   │   ├── page.tsx
    │   │   │   └── [id]/page.tsx
    │   │   ├── pegawai/
    │   │   │   ├── page.tsx
    │   │   │   ├── tambah/page.tsx
    │   │   │   └── [id]/
    │   │   │       ├── page.tsx       ← detail
    │   │   │       └── edit/page.tsx
    │   │   ├── tunjangan/
    │   │   │   ├── page.tsx
    │   │   │   └── setting/page.tsx
    │   │   ├── presensi/
    │   │   │   ├── page.tsx
    │   │   │   └── [id]/page.tsx
    │   │   └── log/
    │   │       └── page.tsx
    │   └── api/
    │       ├── auth/
    │       │   ├── login/route.ts
    │       │   ├── verify-otp/route.ts
    │       │   ├── logout/route.ts
    │       │   ├── me/route.ts
    │       │   └── captcha/route.ts
    │       ├── users/
    │       │   ├── route.ts
    │       │   └── [id]/route.ts
    │       ├── pegawai/
    │       │   ├── route.ts
    │       │   ├── [id]/route.ts
    │       │   └── [id]/download-pdf/route.ts
    │       ├── tunjangan/
    │       │   ├── route.ts
    │       │   └── setting/route.ts
    │       ├── presensi/
    │       │   ├── route.ts
    │       │   ├── [id]/route.ts
    │       │   ├── import/route.ts
    │       │   └── template/route.ts
    │       ├── log/route.ts
    │       ├── dashboard/route.ts
    │       ├── wilayah/
    │       │   ├── provinsi/route.ts
    │       │   ├── kabupaten/route.ts
    │       │   ├── kecamatan/route.ts
    │       │   └── kalurahan/route.ts
    │       └── docs/route.ts          ← Swagger JSON spec
    ├── components/
    │   ├── common/
    │   │   ├── sidebar.tsx
    │   │   ├── navbar.tsx
    │   │   ├── data-table.tsx
    │   │   ├── pagination.tsx
    │   │   ├── confirm-modal.tsx
    │   │   ├── loading-spinner.tsx
    │   │   └── alert-toast.tsx
    │   ├── auth/
    │   │   ├── login-form.tsx
    │   │   └── otp-form.tsx
    │   ├── dashboard/
    │   │   ├── widget-card.tsx
    │   │   ├── doughnut-chart.tsx
    │   │   └── map-domisili.tsx
    │   ├── pegawai/
    │   │   ├── pegawai-form.tsx
    │   │   └── pendidikan-dynamic-form.tsx
    │   ├── users/
    │   │   └── user-form.tsx
    │   ├── presensi/
    │   │   └── import-excel-modal.tsx
    │   └── tunjangan/
    │       └── setting-form.tsx
    ├── lib/
    │   ├── prisma.ts              ← Prisma client singleton
    │   ├── jwt.ts                 ← sign & verify token
    │   ├── with-auth.ts           ← HOF wrapper auth + role guard
    │   ├── activity-log.ts        ← createLog() helper
    │   ├── captcha.ts             ← generate & validate captcha (canvas)
    │   ├── otp.ts                 ← generate, send, verify OTP
    │   ├── mailer.ts              ← nodemailer transporter
    │   ├── tunjangan-calc.ts      ← hitungTunjangan()
    │   ├── presensi-calc.ts       ← hitungDurasi(), tentukanStatus()
    │   ├── pdf-generator.ts       ← generate employee PDF (pdfkit)
    │   ├── excel-parser.ts        ← parse presensi Excel (xlsx)
    │   └── api-response.ts        ← success/error response helper
    ├── hooks/
    │   ├── use-auth.ts
    │   ├── use-api.ts
    │   └── use-debounce.ts
    ├── types/
    │   └── index.ts               ← all TypeScript types & interfaces
    └── __tests__/
        ├── tunjangan-calc.test.ts
        └── presensi-calc.test.ts

=== PRISMA SCHEMA (required tables) ===
Create the following models in prisma/schema.prisma:
- Provinsi (id, nama)
- Kabupaten (id, nama, provinsiId)
- Kecamatan (id, nama, kabupatenId)
- Kalurahan (id, nama, kecamatanId)
- Pegawai (id uuid, nip unique, nama, email unique, nomorHp,
  fotoUrl, jabatan enum, departemen enum, jenisPegawai enum,
  gender enum, statusKawin enum, jumlahAnak, tanggalLahir,
  tempatLahirId, tanggalMasuk, provinsi, kabupatenNama,
  kecamatanId, kalurahanId, alamatDetail, latitude decimal(10,8),
  longitude decimal(11,8), isActive, deletedAt, createdAt, updatedAt)
- Pendidikan (id uuid, pegawaiId, jenjang, institusi, jurusan, tahunLulus)
- User (id uuid, pegawaiId unique FK, username unique, email unique,
  nomorHp, password bcrypt, role enum, isActive, lastLogin,
  rememberToken, createdAt, updatedAt)
- OtpSession (id uuid, userId FK, otpCode, expiresAt, isUsed, createdAt)
- CaptchaSession (id uuid, sessionKey unique, answer, expiresAt, isUsed, createdAt)
- SettingTunjanganTransport (id uuid, baseFare decimal, keterangan, isActive, createdAt, updatedAt)
- TunjanganTransport (id uuid, pegawaiId FK, bulan, tahun, baseFare,
  jarakKm, jarakKmBulatkan, jumlahHariMasuk, totalTunjangan, keterangan,
  createdAt, updatedAt — unique pegawaiId+bulan+tahun)
- Presensi (id uuid, pegawaiId FK, tanggal date, lokasiCheckin enum,
  lokasiCheckout enum, waktuCheckin, waktuCheckout, statusKehadiran enum,
  durasiJam decimal(4,1), statusTerpenuhi, verifikasi enum, verifikator enum,
  keterangan, bulan, tahun, createdAt, updatedAt — unique pegawaiId+tanggal)
- ActivityLog (id uuid, userId FK nullable, username, modul enum,
  aksi enum, deskripsi, ipAddress, userAgent, createdAt)

Required Enums:
Role: SUPERADMIN, MANAGER_HRD, ADMIN_HRD
JabatanType: MANAGER, STAF, MAGANG, KARYAWAN
DepartemenType: MARKETING, HRD, PRODUCTION, EXECUTIVE, COMMISSIONER
JenisPegawai: KONTRAK, TETAP, MAGANG
StatusKawin: KAWIN, TIDAK_KAWIN
GenderType: PRIA, WANITA
ModulLog: LOGIN, LOGOUT, USER, PEGAWAI, TUNJANGAN, SETTING_TUNJANGAN, PRESENSI, LOG, DASHBOARD
AksiLog: LOGIN, LOGOUT, CREATE, READ, UPDATE, DELETE, IMPORT, DOWNLOAD
StatusVerifikasi: DISETUJUI, DITOLAK, PENDING
Verifikator: LEAD, MANAGER, HRD
StatusKehadiran: HADIR, CUTI, IZIN, UNPAID_LEAVE
LokasiGedung: GEDUNG_UTAMA, GEDUNG_A, GEDUNG_B

=== ROLE & ACCESS STRUCTURE ===
3 roles: SUPERADMIN, MANAGER_HRD, ADMIN_HRD

| Module                  | SUPERADMIN                        | MANAGER_HRD      | ADMIN_HRD                                  |
|-------------------------|-----------------------------------|------------------|--------------------------------------------|
| Login/Logout            | Y                                 | Y                | Y                                          |
| Manage Users            | CRUD (cannot delete self)         | RO, Update Self  | RO, Update Self                            |
| Dashboard               | Welcome message only              | Widget+chart+map | Welcome message only                       |
| Employee Data Module    | Cannot access                     | Read Only        | CRUD (except deleting superadmin employee) |
| Allowance Module        | Cannot access                     | Read Only        | Read Only                                  |
| Allowance Setting       | Cannot access                     | Cannot access    | CRUD                                       |
| Attendance Module       | Cannot access                     | Read Only        | CRUD                                       |
| Log Module              | Read Only                         | Cannot access    | Cannot access                              |

=== MODULE 1: LOGIN ===
Create files: src/app/(auth)/login/page.tsx, src/app/api/auth/login/route.ts,
src/app/api/auth/captcha/route.ts, src/app/api/auth/verify-otp/route.ts,
src/lib/captcha.ts, src/lib/otp.ts

Requirements:
- Login input: can be username OR email OR phone number
- Captcha input: generate PNG image on the server using the "canvas" library,
  save answer in CaptchaSession table, send base64 image + sessionKey to client
- After credential + captcha validation is successful:
  1. Send 6-digit OTP to user's email via nodemailer
  2. Save OTP in OtpSession table, valid for 60 seconds
  3. Return tempToken (short-lived JWT 5 minutes containing only userId)
- Client submits tempToken + otpCode to /api/auth/verify-otp
- If OTP is valid: return final JWT (8 hours normal, 30 days if rememberMe: true)
- Password rules (backend validation): min 8 chars, contains uppercase,
  lowercase, special character, no spaces
- Captcha is case-insensitive

=== MODULE 2: MANAGE USERS ===
Create files: src/app/(dashboard)/users/page.tsx, src/app/(dashboard)/users/[id]/page.tsx,
src/app/api/users/route.ts, src/app/api/users/[id]/route.ts,
src/components/users/user-form.tsx

Requirements:
- Name Input Field: autosuggestion from Employee data, minimum 2 characters
  typed then suggest appears, user must select from list (no free input)
- Username Field: min 6 chars, lowercase alphanumeric only, unique,
  onkeyup validation (check availability to API)
- Email & Phone No Field: autofill from selected employee data, input disabled
- Password: auto-generate when CREATE new (display once in modal after create)
  User can change their own password on the profile page
- Active/Inactive status: if currently logged-in user is deactivated by admin,
  then that user's token must be invalid (check isActive when verifying token in with-auth.ts)
- SUPERADMIN can CRUD all users except delete themselves
- MANAGER_HRD and ADMIN_HRD can only Read all users and Update their own data

=== MODULE 3: DASHBOARD ===
Create files: src/app/(dashboard)/dashboard/page.tsx,
src/app/api/dashboard/route.ts,
src/components/dashboard/widget-card.tsx,
src/components/dashboard/doughnut-chart.tsx,
src/components/dashboard/map-domisili.tsx

Requirements:
a. SUPERADMIN: display text "Welcome [Username] - [Role]"
b. ADMIN_HRD: display text "Welcome [Username] - [Role]"
c. MANAGER_HRD display:
   - 4 widget cards: Total Employees, Total Contract, Total Permanent, Total Intern
   - Doughnut Chart 1: Contract vs Permanent vs Intern (chart.js + react-chartjs-2)
   - Doughnut Chart 2: Male vs Female
   - Table: 5 employees with the most recent joining dates (columns: name, position, join date)
   - Map with Leaflet.js + OpenStreetMap (react-leaflet):
     * Marker cluster of all employees' domiciles (lat/lng from employee data)
     * Office marker (default coordinates: lat -7.7956, lng 110.3695)
     * Info of closest employee to the office (calculate Haversine distance, show name + distance)
   - NOTE: react-leaflet can only be rendered client-side,
     use dynamic import with ssr: false

=== MODULE 4: EMPLOYEE DATA ===
Create files: src/app/(dashboard)/pegawai/page.tsx,
src/app/(dashboard)/pegawai/tambah/page.tsx,
src/app/(dashboard)/pegawai/[id]/page.tsx,
src/app/(dashboard)/pegawai/[id]/edit/page.tsx,
src/app/api/pegawai/route.ts, src/app/api/pegawai/[id]/route.ts,
src/app/api/pegawai/[id]/download-pdf/route.ts,
src/components/pegawai/pegawai-form.tsx,
src/components/pegawai/pendidikan-dynamic-form.tsx

a. Employee List Page (table):
Columns: No, NIP, Name, Position, Join Date, Tenure (auto-calculated), Action
Table features:
- Sorting: NIP, Name, Position, Join Date, Tenure
- Pagination: 10 records per page
- Bulk select with checkboxes
- Search: search by name / NIP / position
- Position Filter: multiselect dropdown (Manager, Staff, Intern, Employee)
- Tenure Filter: operator dropdown (>, =, <) + number input (years)
- Type Filter: multiselect dropdown (Contract, Permanent, Intern)
- Buttons: [+ New Data] [Download PDF List] [Delete Data (bulk)] [Status ▼ (active/inactive)]
- Action Column per row: [Detail] [Edit] [Download PDF]

b. Add/Edit Employee Form (src/components/pegawai/pegawai-form.tsx):
Fields with onkeyup validation rules:
- Photo: upload PNG/JPEG/JPG, preview after selecting file
- NIP: min 8 characters, numbers only, unique
- Name: only letters, numbers, apostrophe ('), space
- Email: standard email format
- Phone Number: mandatory international format (example: +6282218458888)
- Province: text input disabled, automatically filled when selecting district (kecamatan)
- Regency/City (Kabupaten): text input disabled, automatically filled when selecting district
- District (Kecamatan): searchable dropdown (react-select), option displays
  "District Name - Regency Name" to avoid ambiguity if names are identical
- Village (Kalurahan): searchable dropdown, filtered based on selected district
- Detailed Address: textarea
- Latitude: number input, range validation -90 to 90
- Longitude: number input, range validation -180 to 180
- Birthplace: searchable regency dropdown (react-select),
  minimum 2 characters typed for autosuggestion
- Birth Date: date picker (display format DD/MM/YYYY)
- Marital Status: radio button (Married / Not Married)
- Number of Children: number input, min 0, max 99
- Join Date: date picker (display format DD/MM/YYYY)
- Position: select (Manager, Staff, Intern, Employee)
- Employee Type: select (Contract, Permanent, Intern)
- Gender: radio button (Male / Female)
- Department: select (Marketing, HRD, Production, Executive, Commissioner)
- Age: text input disabled, auto-calculated from birth date (in years)
- Education: dynamic form (can add/remove rows),
  per row: Level, Institution, Major, Graduation Year
- Status: Active/Inactive checkbox

c. Detail Page: display all data read-only, including education list

=== MODULE 5: TRANSPORT ALLOWANCE SETTING ===
Create files: src/app/(dashboard)/tunjangan/setting/page.tsx,
src/app/api/tunjangan/setting/route.ts,
src/components/tunjangan/setting-form.tsx

Requirements:
- CRUD for base fare (allowance rate per km)
- Fields: baseFare (decimal), description, isActive
- Only 1 setting can be active at a time
- Only ADMIN_HRD can access

=== MODULE 6: TRANSPORT ALLOWANCE MODULE ===
Create files: src/app/(dashboard)/tunjangan/page.tsx,
src/app/api/tunjangan/route.ts,
src/lib/tunjangan-calc.ts

Formula: Allowance = base_fare × rounded_km × number_of_days_attended

Rules (implement in src/lib/tunjangan-calc.ts):
- Km rounding: decimal < 0.5 → round down, decimal >= 0.5 → round up
- Minimum 19 days attended. Less than that = allowance 0
- Maximum effective distance 25 km (if > 25 km, calculate only 25 km)
- Minimum distance > 5 km to get allowance (distance ≤ 5 km = allowance 0)
- Only permanent employees (jenisPegawai = TETAP) get allowance

=== MODULE 7: ACTIVITY LOG ===
Create files: src/app/(dashboard)/log/page.tsx,
src/app/api/log/route.ts

Requirements:
- Every CRUD action in all modules must call the createLog() helper from lib/activity-log.ts
- Logs can only be viewed by SUPERADMIN
- Log table: Date, Time, Username, Description, Module
- Search feature: by username, by description
- Filters:
  * Username: multiselect (react-select)
  * Module: multiselect (react-select)
  * Daterange: date range picker (react-datepicker)
- Pagination 20 rows per page

=== MODULE 8: ATTENDANCE ===
Create files: src/app/(dashboard)/presensi/page.tsx,
src/app/(dashboard)/presensi/[id]/page.tsx,
src/app/api/presensi/route.ts, src/app/api/presensi/[id]/route.ts,
src/app/api/presensi/import/route.ts,
src/app/api/presensi/template/route.ts,
src/components/presensi/import-excel-modal.tsx,
src/lib/presensi-calc.ts, src/lib/excel-parser.ts

a. Employee List Page (attendance recap):
- Default displays data from month N-1 (last month)
- Table columns: No, Name, Position, Present, Attendance Status (Fulfilled/Unfulfilled),
  Leave, Leave Quota, Permission, Permission Quota, Unpaid Leave, Unpaid Leave Quota, [View Detail]
- Buttons: [Download Excel Template] [Import Excel] [Filter Month/Year]
- Excel import flow:
  1. User clicks Download Template → downloads empty .xlsx file formatted accordingly
  2. User fills template, uploads via modal
  3. Server parses Excel (lib/excel-parser.ts), validates data, saves to Presensi table
  4. Response after import: table refreshes automatically

b. Employee Attendance Detail Page:
Columns: Date, Check-in Location, Attendance (Present/Leave/Permission/Unpaid Leave),
Duration (hours, 1 decimal), Status (Fulfilled/Unfulfilled), Verification, Verifier, Description

Attendance calculation rules (implement in src/lib/presensi-calc.ts):
- 3 buildings: GEDUNG_UTAMA, GEDUNG_A, GEDUNG_B
- Check-in and check-out MUST be at the same location,
  if different → counted as not attended (Unfulfilled status)
- Fixed working hours: 08:00–17:00, break time 12:00–13:00
- Work duration is calculated excluding break time
- Lateness ≤ 15 minutes from 08:00 → counted as fully attended
- Lateness > 15 minutes → counted as half-day,
  but minimum work duration must still be 8 hours to be fulfilled
- If work duration < 8 hours → status "Unfulfilled"
- Work duration minimum 8 hours (excluding break) → status "Fulfilled"

=== API MIDDLEWARE PATTERN ===
All API route handlers requiring auth must be wrapped with with-auth.ts.
Pattern example:

// src/app/api/pegawai/route.ts
import { withAuth } from '@/lib/with-auth';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withAuth(
  async (req, ctx, user) => {
    // handler logic
    return NextResponse.json({ success: true, data: [] });
  },
  'ADMIN_HRD', 'MANAGER_HRD' // allowed roles
);

=== SWAGGER / API DOCS ===
Create file: src/app/api/docs/route.ts

Use next-swagger-doc to generate OpenAPI spec from JSDoc comments
in each route handler. The GET /api/docs endpoint returns the JSON spec.
Also create a page src/app/api-docs/page.tsx that renders swagger-ui-react.
Document at least endpoints: auth (login, verify-otp, captcha),
users (CRUD), pegawai (CRUD, download-pdf), tunjangan, presensi, log.

=== DOCKER ===
Create multi-stage Dockerfile:
- Stage deps: install dependencies
- Stage builder: prisma generate + next build
- Stage runner: run next start (standalone output)

Create docker-compose.yml with services:
- postgres: postgres:16-alpine image, port 5432, volume, healthcheck
- app: build from Dockerfile, depends_on postgres healthy,
  port 3000, env from .env, volume for uploads

=== SEED DATA ===
Create prisma/seeds/seed.ts that generates:
- Sample region data: 1 province (DI Yogyakarta), 3 regencies, 5 districts, 10 villages
- 1 employee + SUPERADMIN user: username=superadmin, password=Admin@12345
- 1 employee + MANAGER_HRD user: username=managerhrd, password=Manager@12345
- 1 employee + ADMIN_HRD user: username=adminhrd, password=Admin@12345
- 5 dummy employees without users (for testing employee module)
- 1 active transport allowance setting: baseFare = 2500
- Sample attendance data for last month (minimum 3 employees)

=== TESTING ===
Create jest.config.ts and src/__tests__/:

src/__tests__/tunjangan-calc.test.ts → test all edge cases:
- Employee not PERMANENT → allowance 0
- Attended days < 19 → allowance 0
- Distance ≤ 5 → allowance 0
- Distance > 25 → calculate only 25 km
- Rounding 0.4 → round down
- Rounding 0.5 → round up
- Normal calculation

src/__tests__/presensi-calc.test.ts → test:
- Check-in location ≠ check-out → unfulfilled
- Lateness ≤ 15 mins → fulfilled
- Lateness > 15 mins, duration < 8 hours → unfulfilled
- Lateness > 15 mins, duration >= 8 hours → fulfilled
- Duration cut by break time 12:00-13:00

=== README.md ===
Create README.md containing:
- Project description
- Prerequisites (Node 20+, Docker, PostgreSQL)
- Quick start with Docker (3 steps)
- Quick start without Docker (development)
- Default credentials table (superadmin, managerhrd, adminhrd)
- Environment variables explanation (.env.example)
- Access URLs: app (3000), swagger (/api-docs)
- How to run tests: pnpm test
- Assumptions made

=== IMPORTANT NOTES ===
1. All form validations are done onkeyup (real-time, not just onsubmit)
2. Every CRUD action automatically calls createLog() — don't miss any
3. Use soft delete (deletedAt) for employee data, not hard delete
4. react-leaflet must be dynamic import with { ssr: false }
5. Prisma client made singleton in lib/prisma.ts to avoid
   "too many connections" in development (Next.js hot reload)
6. All file names are kebab-case
7. Use TypeScript strict mode
8. All API responses use format:
   { success: boolean, message: string, data: any, meta?: { page, limit, total } }
9. Default office coordinates: lat -7.7956, lng 110.3695 (Sleman, Yogyakarta)