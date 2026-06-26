# FitBinder

**NestJS microservices monorepo** สำหรับจัดการ Personal Trainer, Trainee, Training Package, Appointment และ Health History — ออกแบบตาม **Bounded Context (BC)** pattern

**Stack**: NestJS 11 · TypeScript 5.7 · PostgreSQL + TypeORM · TCP Microservices · Swagger/Scalar · Jest  
**Frontend**: Angular 22 (standalone Angular CLI app ใน `apps/web`)

---

## Monorepo Structure

```
apps/
  auth/               # Auth service          HTTP :3001 | TCP :4001
  trainer-bc/         # Trainer BC            HTTP :3002 | TCP :4002
  trainee-bc/         # Trainee + Health BC   HTTP :3003 | TCP :4003
  package-bc/         # Package + Purchase BC HTTP :3004 | TCP :4004
  appointment-bc/     # Appointment + Session HTTP :3005 | TCP :4005
  web/                # Angular 22 frontend   HTTP :4200

libs/
  common/     # BaseEntity, base operations, decorators (backend only)
  config/     # Config module (backend only)
  database/   # TypeORM + migrations (backend only)
  contracts/  # Framework-agnostic TS types (shared: web + backend)
```

---

## Prerequisites

- **Node.js** ≥ 24 (ดูเวอร์ชันใน `.nvmrc` → `nvm use`)
- **pnpm** (package manager)
- **PostgreSQL** (หนึ่ง database ต่อหนึ่ง BC)

---

## Installation

```bash
# ติดตั้ง dependencies ทั้ง monorepo root
pnpm install

# ติดตั้ง dependencies ฝั่ง Frontend
pnpm --dir apps/web install
```

---

## Running the Backend

### Development (watch mode)

```bash
# รันทีละ service
pnpm start:dev:auth
pnpm start:dev:trainer-bc
pnpm start:dev:trainee-bc
pnpm start:dev:package-bc
pnpm start:dev:appointment-bc

# รันทุก service พร้อมกัน (concurrently)
pnpm start:dev:all
```

### Production

```bash
# Build ทีละ service
pnpm build:auth
pnpm build:trainer-bc
pnpm build:trainee-bc
pnpm build:package-bc
pnpm build:appointment-bc

# หรือ build ทั้งหมด
pnpm build:all

# Start production build (example: auth)
node dist/apps/auth/main
```

---

## Running the Frontend

```bash
# Development server (Angular dev server ที่ port 4200)
pnpm start:web

# หรือจาก apps/web โดยตรง
pnpm --dir apps/web start

# Production build
pnpm build:web

# Run tests (Angular)
pnpm test:web
```

> **หมายเหตุ**: Angular dev server จะ proxy `/api/<bc>/*` ไปยัง HTTP port ของแต่ละ BC โดยอัตโนมัติ ผ่าน `apps/web/proxy.conf.json`

---

## API Docs

เมื่อรัน service แล้ว เข้าดู docs ได้ที่:

| Service | Scalar (Recommended) | Swagger UI |
|---|---|---|
| auth | `http://localhost:3001/auth/v1/api-docs` | `/auth/v1/classic-docs` |
| trainer-bc | `http://localhost:3002/trainer/v1/api-docs` | `/trainer/v1/classic-docs` |
| trainee-bc | `http://localhost:3003/trainee/v1/api-docs` | `/trainee/v1/classic-docs` |
| package-bc | `http://localhost:3004/package/v1/api-docs` | `/package/v1/classic-docs` |
| appointment-bc | `http://localhost:3005/appointment/v1/api-docs` | `/appointment/v1/classic-docs` |

---

## Database Migrations

แต่ละ BC มี database เป็นของตัวเอง Migration ต้องใช้ CLI เสมอ — ห้าม hand-write timestamp

```bash
# Run migrations (ทีละ BC)
pnpm migration:run:auth
pnpm migration:run:trainer
pnpm migration:run:trainee
pnpm migration:run:package
pnpm migration:run:appointment

# Run ทั้งหมดพร้อมกัน
pnpm migration:run:all

# Generate migration (example: trainer)
pnpm migration:generate:trainer --name=AddTrainerStatus

# Revert migration
pnpm migration:revert:auth
pnpm migration:revert:trainer
# ... (ทำนองเดียวกันกับ BC อื่น)
```

| BC | Database | Env Prefix |
|---|---|---|
| auth | `fit_binder_auth` | `AUTH_DB_*` |
| trainer-bc | `fit_binder_trainer` | `TRAINER_DB_*` |
| trainee-bc | `fit_binder_trainee` | `TRAINEE_DB_*` |
| package-bc | `fit_binder_package` | `PACKAGE_DB_*` |
| appointment-bc | `fit_binder_appointment` | `APPOINTMENT_DB_*` |

---

## Test & Lint

```bash
# Unit tests (backend)
pnpm test

# Test + coverage
pnpm test:cov

# ESLint (auto-fix)
pnpm lint

# Prettier format
pnpm format
```

---

## Contributing

ดู [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) สำหรับ conventions ทั้งหมด เช่น naming rules, entity/DTO/service/controller patterns, และ Swagger doc guidelines

สำหรับการเพิ่ม entity ใหม่ ให้ใช้ Skill `implement-entity` เสมอ:

```
/implement-entity
```
