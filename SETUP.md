# Stock AVG Calculator — Setup & Deploy Guide

## โครงสร้างโปรเจกต์

```
stock-avg-calculator/
├── prisma/
│   ├── schema.prisma       ← Database models
│   └── seed.ts             ← Demo data
├── src/
│   ├── app/
│   │   ├── api/            ← API Routes (REST)
│   │   ├── (auth)/         ← Login / Register pages
│   │   └── (dashboard)/    ← Dashboard page
│   ├── components/
│   │   ├── ui/             ← shadcn/ui primitives
│   │   ├── auth/           ← Login/Register forms
│   │   └── dashboard/      ← Dashboard widgets
│   ├── lib/                ← prisma, auth, utils, calculations
│   ├── schemas/            ← Zod validation schemas
│   ├── store/              ← Zustand state
│   └── types/              ← TypeScript types
└── ...config files
```

---

## ขั้นตอนติดตั้งและรัน (Local)

### 1. Clone / copy โปรเจกต์
```bash
cd stock-avg-calculator
```

### 2. ติดตั้ง dependencies
```bash
npm install
```

### 3. สร้างไฟล์ .env
```bash
cp .env.example .env
```

แก้ไข `.env`:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-random-secret-here"   # เปลี่ยนเป็น random string
NEXTAUTH_URL="http://localhost:3000"
```

สร้าง secret ด้วยคำสั่ง:
```bash
openssl rand -base64 32
```

### 4. สร้าง Database และ migrate
```bash
npm run db:migrate
```

### 5. Seed ข้อมูลทดสอบ
```bash
npm run db:seed
```

ผลลัพธ์:
```
✅ Created user: demo@example.com
✅ Created stock: NVDA with 3 purchases
✅ Created stock: AAPL with 2 purchases
✅ Created stock: TSLA with 1 purchase

📧 Login: demo@example.com
🔑 Password: demo1234
```

### 6. รัน development server
```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ **http://localhost:3000**

---

## Deploy บน Vercel

### ⚠️ ข้อจำกัดสำคัญ: SQLite ไม่รองรับ Vercel
Vercel เป็น Serverless — filesystem เป็น read-only ทำให้ SQLite ไม่ทำงาน

**แนะนำ 2 ตัวเลือก:**

---

### ตัวเลือก A: Neon PostgreSQL (ฟรี, แนะนำ)

**1. สมัคร Neon: https://neon.tech**

**2. สร้าง Database ใหม่ → copy connection string**

**3. แก้ไข `prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "postgresql"        // เปลี่ยนจาก sqlite
  url      = env("DATABASE_URL")
}
```

**4. รัน migrate ใหม่:**
```bash
npx prisma migrate dev --name init
```

---

### ตัวเลือก B: Turso (SQLite บน Edge, ฟรี)

**1. ติดตั้ง Turso CLI:**
```bash
npm install -g turso
turso auth signup
turso db create stock-avg-db
turso db tokens create stock-avg-db
```

**2. เพิ่มใน `package.json` dependencies:**
```json
"@libsql/client": "^0.6.0",
"@prisma/adapter-libsql": "^5.10.0"
```

**3. แก้ไข `prisma/schema.prisma`:**
```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**4. แก้ไข `src/lib/prisma.ts`:**
```typescript
import { PrismaClient } from "@prisma/client"
import { PrismaLibSQL } from "@prisma/adapter-libsql"
import { createClient } from "@libsql/client"

const libsql = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

const adapter = new PrismaLibSQL(libsql)
export const prisma = new PrismaClient({ adapter })
```

---

### Deploy ขึ้น Vercel

**1. Push โค้ดขึ้น GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/stock-avg-calculator
git push -u origin main
```

**2. สมัคร Vercel: https://vercel.com**

**3. Import GitHub repository**

**4. ตั้ง Environment Variables ใน Vercel Dashboard:**

| Key | Value |
|-----|-------|
| `DATABASE_URL` | PostgreSQL/Turso connection string |
| `NEXTAUTH_SECRET` | random string (openssl rand -base64 32) |
| `NEXTAUTH_URL` | https://your-app.vercel.app |
| `TURSO_AUTH_TOKEN` | (ถ้าใช้ Turso เท่านั้น) |

**5. Deploy** — Vercel จะ build และ deploy อัตโนมัติ

**6. Run database migration บน Vercel:**

ใน Vercel Dashboard → Settings → Functions → เพิ่ม build command:
```
prisma generate && prisma migrate deploy && next build
```

หรือใน `package.json`:
```json
"build": "prisma generate && prisma migrate deploy && next build"
```

---

## คำสั่งที่มีประโยชน์

| คำสั่ง | ใช้สำหรับ |
|--------|-----------|
| `npm run dev` | รัน dev server |
| `npm run build` | Build สำหรับ production |
| `npm run db:migrate` | สร้าง/อัพเดท database |
| `npm run db:seed` | ใส่ข้อมูลทดสอบ |
| `npm run db:studio` | เปิด Prisma Studio (GUI) |
| `npm run db:reset` | Reset DB + seed ใหม่ |

---

## Tech Stack สรุป

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui (Radix UI) |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Database | SQLite (dev) / PostgreSQL หรือ Turso (prod) |
| ORM | Prisma |
| Auth | NextAuth.js v4 |
| Deploy | Vercel |
