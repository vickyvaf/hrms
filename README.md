# HRMS - Human Resource Management System

A full-stack Human Resource Management System built with Next.js 16, Prisma, and PostgreSQL.

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
- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL + Prisma ORM
- **Styling:** Bootstrap 5 (No Tailwind, No Gradients)
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
