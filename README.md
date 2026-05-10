# HRMS - Human Resource Management System

A full-stack Human Resource Management System built with Next.js 16, Prisma, and PostgreSQL.

## Preview
<img width="1667" height="954" alt="Screenshot 2026-05-10 at 15 45 06" src="https://github.com/user-attachments/assets/31792e43-f703-4dfe-9212-7d0dc4bbafcf" />
<img width="1669" height="955" alt="Screenshot 2026-05-10 at 15 45 26" src="https://github.com/user-attachments/assets/a530bdf5-931e-466f-a231-1b9f8eb9379c" />
<img width="1667" height="955" alt="Screenshot 2026-05-10 at 15 45 40" src="https://github.com/user-attachments/assets/beffd822-d4a8-434c-9ebe-902fc12c1e3b" />
<img width="1664" height="953" alt="Screenshot 2026-05-10 at 15 46 01" src="https://github.com/user-attachments/assets/a6299025-37bc-4f76-a58f-580efe6a6c57" />
<img width="1664" height="954" alt="Screenshot 2026-05-10 at 15 46 13" src="https://github.com/user-attachments/assets/12557612-237a-4d2e-bc39-88f5f88461fd" />


## Features
- Two-step authentication (Credentials + Captcha -> OTP)
- Role-based access control (SUPERADMIN, MANAGER_HRD, ADMIN_HRD)
- Dashboard with charts and Leaflet maps for Manager
- Employee management with photo upload and dynamic education forms
- Attendance tracking with Excel import/export
- Transport allowance calculation
- Activity logging for audit trails
- Swagger API documentation

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL + Prisma ORM
- **Styling:** Bootstrap 5
- **Auth:** JWT + OTP (Nodemailer)
- **Tools:** Canvas (Captcha), PDFKit (PDF export), XLSX (Excel)

## Quick Start (with Docker)

1. **Clone the repository**
2. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
3. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```
4. **Access the app**
   - App: `http://localhost:3000`
   - Swagger Docs: `http://localhost:3000/api-docs`

## Quick Start (Development)

1. **Install dependencies**
   ```bash
   pnpm install
   ```
2. **Setup PostgreSQL and update `.env`**
3. **Run Migrations & Seed**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```
4. **Run Development Server**
   ```bash
   pnpm dev
   ```

## Default Credentials
| Username | Password | Role |
|----------|----------|------|
| superadmin | Admin@12345 | SUPERADMIN |
| managerhrd | Manager@12345 | MANAGER_HRD |
| adminhrd | Admin@12345 | ADMIN_HRD |

## Testing
```bash
pnpm test
```
