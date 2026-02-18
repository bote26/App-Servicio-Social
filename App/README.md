# Social Service Fair MVP

A full-stack application for managing Social Service Fair enrollments.

## Tech Stack
- **Client**: Vite + React + TypeScript + Tailwind CSS
- **Server**: Node.js + Express + TypeScript + Prisma + PostgreSQL

## Setup & Running

1. **Database Setup**
   Ensure PostgreSQL is running.
   ```bash
   cd server
   npx prisma migrate dev --name init
   npx ts-node prisma/seed.ts
   ```

2. **Start Server**
   ```bash
   cd server
   npm run dev
   ```
   Server runs on `http://localhost:3001`.

3. **Start Client**
   ```bash
   cd client
   npm install
   npm run dev
   ```
   Client runs on `http://localhost:5173`.

## Features
- **Roles**:
  - **Student**: Register time slot, search projects, enroll (requires secret code).
  - **Partner**: View managed projects and their secret codes.
  - **Organizer**: View all projects and export enrollment report to Excel.

## Credentials (Seed Data)
- **Organizer**: `admin@tec.mx` / `password123`
- **Partner**: `partner@org.com` / `password123`
- **Student**: `a00123456@tec.mx` / `password123`
