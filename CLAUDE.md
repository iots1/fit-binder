# CLAUDE.md

AI context and guidance for the **FitBinder NestJS monorepo**.

<GoldenRule>
- Do NOT disable or bypass eslint rules — the project follows strict linting and formatting conventions.
- Follow the established project structure and architectural patterns without deviation.
- Always use the `implement-entity` Skill workflow when adding a new entity/CRUD so code stays consistent.
- For any new feature, align with the existing conventions documented here and in `.claude/skills/`.
</GoldenRule>

## Project Overview

**NestJS microservices monorepo** for managing personal trainers, trainees, training
packages, appointments and trainee health history — organized with **Bounded Context (BC)**
patterns.

**Stack**: NestJS 11, TypeScript 5.7, PostgreSQL + TypeORM, TCP transport (microservices),
Swagger/Scalar API docs, Jest. Frontend: Angular (in `apps/web`).

---

## Architecture

### Monorepo

```
apps/   auth | trainer-bc | trainee-bc | package-bc | appointment-bc   # NestJS (nest-cli + webpack)
        web                                                            # Angular 22 (standalone Angular CLI app)
libs/   common | config | database     # backend-only (Nest/TypeORM)
        contracts                      # framework-agnostic TS types shared by web + backend
```

**Node**: use the version in `.nvmrc` (`nvm use`). Angular 22 needs Node ≥ 24.15.

### Frontend (`apps/web`)

Standalone Angular CLI app with its own `package.json` / `angular.json` (run
`pnpm --dir apps/web ...`, or `pnpm start:web` / `pnpm build:web` from the root).
It imports shared types from `@contracts` (mapped to `libs/contracts/src` in
`apps/web/tsconfig.json`) — never `@lib/common` (that would pull Nest/TypeORM into
the browser bundle). The dev server proxies `/api/<bc>/*` to each BC's HTTP port
via `apps/web/proxy.conf.json`.

### Bounded Context Rules

- Each BC **owns** its data — other BCs call via `@MessagePattern` (TCP), never direct DB access.
- `trainer-bc` owns trainers; `trainee-bc` owns trainees + health records; `package-bc` owns
  packages + purchases; `appointment-bc` owns appointments + training sessions.
- **Rule of Second Use**: start local; move to `libs/` only when genuinely cross-cutting.

### Databases (one per Bounded Context)

Each BC owns its own physical PostgreSQL database, keyed by the `FitBinderDatabases`
enum (`@lib/common`). The enum value is both the database name and the TypeORM
connection name.

| BC              | `FitBinderDatabases` | Database name            | Env prefix       |
| --------------- | -------------------- | ------------------------ | ---------------- |
| auth            | `AUTH`               | `fit_binder_auth`        | `AUTH_DB_*`      |
| trainer-bc      | `TRAINER`            | `fit_binder_trainer`     | `TRAINER_DB_*`   |
| trainee-bc      | `TRAINEE`            | `fit_binder_trainee`     | `TRAINEE_DB_*`   |
| package-bc      | `PACKAGE`            | `fit_binder_package`     | `PACKAGE_DB_*`   |
| appointment-bc  | `APPOINTMENT`        | `fit_binder_appointment` | `APPOINTMENT_DB_*` |

A BC registers its connection with `DatabaseModule.registerAsync(FitBinderDatabases.X)`
(`@lib/database`); entities declare `@Entity({ name, database: FitBinderDatabases.X })`
and are wired via `TypeOrmModule.forFeature([...], FitBinderDatabases.X)` +
`@InjectRepository(Entity, FitBinderDatabases.X)`. Cross-BC data is referenced by plain
UUID columns and fetched over TCP microservices — never via cross-database joins.

### Microservice clients

`CommonModule` (`@lib/common`) registers a TCP `ClientProxy` for every BC (data-driven
from the `AppMicroservice` enum). Inject another BC by its token, e.g.
`@Inject(AppMicroservice.Trainer.name) private trainer: ClientProxy`.

### Port Allocation

| Service         | HTTP | Microservice (TCP) |
| --------------- | ---- | ------------------ |
| auth            | 3001 | 4001               |
| trainer-bc      | 3002 | 4002               |
| trainee-bc      | 3003 | 4003               |
| package-bc      | 3004 | 4004               |
| appointment-bc  | 3005 | 4005               |
| web (Angular)   | 4200 | -                  |

---

## Common Commands

```bash
# Dev (per service)
pnpm start:dev:auth | start:dev:trainer-bc | start:dev:trainee-bc
pnpm start:dev:package-bc | start:dev:appointment-bc
pnpm start:dev:all          # all backend services concurrently

# Build
pnpm build:<service>        # e.g. pnpm build:trainer-bc
pnpm build:all

# Frontend
pnpm start:web              # nx serve web

# Test / Lint
pnpm test | pnpm lint | pnpm format

# Migrations (single DB)
pnpm migration:create --name=CreateTrainers
pnpm migration:generate --name=AddTrainerStatus
pnpm migration:run
pnpm migration:revert
```

**Migration timestamp rule**: never hand-write padded timestamps — use the CLI so
`Date.now()` is used and ordering stays correct.

---

## Key Conventions

**Naming**: files=`kebab-case`, classes=`PascalCase`, vars=`camelCase`, DB columns=`snake_case`,
interfaces=`I`-prefix, booleans=`is_`/`has_`/`can_` prefix. DTO class names end in **`DTO`**
(uppercase) — e.g. `CreateTrainerDTO`.

**CRUD layering** (always use the base classes):
- Entity **extends `BaseEntity`** (`@lib/common`) — never implement `ITimestamp` directly.
- Service **extends `BaseServiceOperations<Entity, CreateDTO, UpdateDTO>`**.
- Controller **extends `BaseControllerOperations<Entity, CreateDTO, UpdateDTO, Service>`**.
- Use the `implement-entity` Skill — it documents the full 5-step workflow.

**API**: All controllers need `@ResourceType('plural-name')`. Use `@ValidatedQuery()` (not
`@Query()`) for query params. Use `@Put` for updates (full replacement), never `@Patch`.
Responses are auto-wrapped into JSON:API by `TransformInterceptor`.

**Swagger/API descriptions live in `*.swagger.ts`, not inline** — keep prose out of
controllers. `*.swagger.ts` = API description strings; `*.constants.ts` = real domain constants
(enums, `*_ALLOWED_RELATIONS`, codes). Never mix.

**Relations enum in Scalar**: when a service has non-empty `allowedRelations`, create
`constants/<resource>.constants.ts` (`RESOURCE_ALLOWED_RELATIONS = [...] as const`) and
`dto/<resource>-query-params.dto.ts` (extends `queryParamsWithRelations(...)`); use it in both
`@ApiQuery({ type })` and `@ValidatedQuery()`.

**Database**: `executeDbOperation()` wraps DB calls inside `BaseServiceOperations`. Use
`dataSource.transaction()` for multi-table writes. Soft delete via `deleted_at` / `is_deleted`.

**No `forwardRef`**: never use `forwardRef()` — it causes undefined deps in the microservice
TCP context. Use a Facade or EventEmitter instead.

**Shared libs** (`@lib/common`): `BaseEntity`, base operations, decorators (`@Public`,
`@CurrentUser`, `@ResourceType`, `@RequirePermission`, `@ValidatedQuery`), `QueryParamsDTO`,
`AppMicroservice` enum, `bootstrapApplication()`. Config: `@lib/config`. DB: `@lib/database`.

---

## Skills (`.claude/skills/`)

| Skill              | Description                                              |
| ------------------ | ------------------------------------------------------- |
| `implement-entity` | 5-step workflow: TypeORM entity + CRUD REST API in a BC |

---

## API Docs

Each service exposes docs at `http://localhost:{HTTP_PORT}/{prefix}/{version}/api-docs`
(Scalar) and `/classic-docs` (Swagger UI). Example: trainer-bc →
http://localhost:3002/trainer/v1/api-docs
