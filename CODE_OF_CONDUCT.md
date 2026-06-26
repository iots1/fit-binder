# FitBinder — Code of Conduct

Convention reference สำหรับ **FitBinder NestJS Monorepo**  
ผู้ที่ร่วมพัฒนาทุกคนต้องปฏิบัติตามข้อกำหนดเหล่านี้อย่างเคร่งครัด

---

## 1. Golden Rules

- **ห้ามปิดหรือข้ามกฎ ESLint** — โปรเจกต์ใช้ strict linting ทุก rule มีเหตุผล
- **ห้ามเบี่ยงจาก architecture** — ทำตาม pattern ที่กำหนดไว้ ไม่ออกแบบใหม่เอง
- **ทุก entity/CRUD ใหม่ต้องใช้ Skill `implement-entity`** — เพื่อความสม่ำเสมอของ codebase
- **feature ใหม่ต้องสอดคล้องกับ convention** ที่ระบุใน `CLAUDE.md` และ `.claude/skills/`

---

## 2. Naming Convention

| สิ่งที่ตั้งชื่อ | รูปแบบ | ตัวอย่าง |
|---|---|---|
| ไฟล์ | `kebab-case` | `create-trainer.dto.ts` |
| คลาส | `PascalCase` | `TrainersService` |
| ตัวแปร / Property | `camelCase` | `firstName` |
| คอลัมน์ DB | `snake_case` | `first_name`, `created_at` |
| Interface | ขึ้นต้นด้วย `I` | `IUserSession`, `ITimestamp` |
| Boolean | ขึ้นต้นด้วย `is_` / `has_` / `can_` | `is_deleted`, `has_paid` |
| DTO class | ลงท้ายด้วย `DTO` (uppercase) | `CreateTrainerDTO`, `UpdateTraineeDTO` |

---

## 3. Entity Convention

Entity ทุกตัวต้อง **extend `BaseEntity`** จาก `@lib/common` เท่านั้น — ห้าม implement `ITimestamp` โดยตรง

```ts
// trainer.entity.ts
import { Column, Entity } from 'typeorm';
import { BaseEntity, FitBinderDatabases } from '@lib/common';

@Entity({ name: 'trainers', database: FitBinderDatabases.TRAINER })
export class Trainer extends BaseEntity {
    @Column({ type: 'varchar', length: 100, comment: 'ชื่อ' })
    first_name: string;

    @Column({ type: 'varchar', length: 100, comment: 'นามสกุล' })
    last_name: string;

    // nullable columns → type: T | null, ห้ามใช้ ?
    @Column({ type: 'varchar', length: 20, nullable: true })
    phone: string | null;
}
```

**`BaseEntity` ให้มาให้แล้ว:**

| Column | Type | หมายเหตุ |
|---|---|---|
| `id` | `uuid` | Primary key (auto-generated) |
| `created_at` | `timestamptz` | Auto-set on insert |
| `created_by` | `uuid \| null` | User ID ผู้สร้าง |
| `updated_at` | `timestamptz` | Auto-set on update |
| `updated_by` | `uuid \| null` | User ID ผู้แก้ไขล่าสุด |
| `is_deleted` | `boolean` | Soft delete flag (default: `false`) |
| `deleted_at` | `timestamptz \| null` | เวลาที่ soft-delete |
| `deleted_by` | `uuid \| null` | User ID ผู้ลบ |
| `deleted_reason` | `text \| null` | เหตุผลที่ลบ |

---

## 4. DTO Convention

### CreateDTO

- Property ที่ nullable ให้ type เป็น `T | null` พร้อม `@IsOptional()` — **ห้ามใช้ `?`**
- ใช้ `@ApiProperty` / `@ApiPropertyOptional` ทุก field

```ts
export class CreateTrainerDTO {
    @ApiProperty({ example: 'Somchai' })
    @IsString()
    @MaxLength(100)
    first_name: string;

    @ApiPropertyOptional({ example: '0812345678', nullable: true })
    @IsOptional()
    @IsString()
    phone: string | null;    // ← ไม่ใช่ phone?: string
}
```

### UpdateDTO

- `extends PartialType(CreateDTO)` เสมอ
- เพิ่มเฉพาะ field ที่ update-only (เช่น `status`)

```ts
export class UpdateTrainerDTO extends PartialType(CreateTrainerDTO) {
    @ApiPropertyOptional({ enum: TrainerStatus })
    @IsOptional()
    @IsEnum(TrainerStatus)
    status: TrainerStatus;
}
```

### ResponseDTO

- `extends IntersectionType(CreateDTO, BaseResponseDTO)` เสมอ

```ts
export class TrainerResponseDTO extends IntersectionType(CreateTrainerDTO, BaseResponseDTO) {}
```

---

## 5. Service Convention

Service ทุกตัวต้อง **extend `BaseServiceOperations`**

```ts
@Injectable()
export class TrainersService extends BaseServiceOperations<
    Trainer,
    CreateTrainerDTO,
    UpdateTrainerDTO
> {
    protected readonly allowedRelations: string[] = [];   // เพิ่ม relation ที่ join ได้

    constructor(
        protected readonly logger: LogsService,
        configService: ConfigService,                      // ไม่ใช่ private — ส่งต่อ super()
        @InjectRepository(Trainer, FitBinderDatabases.TRAINER)
        trainerRepository: Repository<Trainer>,
    ) {
        super(trainerRepository, {
            logging: {
                logger,
                serviceName: configService.get('TRAINER_PREFIX_NAME'),
                serviceVersion: configService.get('TRAINER_PREFIX_VERSION'),
            },
        });
    }
}
```

**กฎ DB operation:**
- ห่อทุก DB call ด้วย `executeDbOperation()` ที่ได้มาจาก base
- ใช้ `dataSource.transaction()` สำหรับ multi-table writes

---

## 6. Controller Convention

Controller ทุกตัวต้อง **extend `BaseControllerOperations`** และมี `@ResourceType`

```ts
@ApiTags('Trainers')
@ResourceType('trainers')          // ← จำเป็น เพื่อ JSON:API wrapping
@Controller('trainers')
export class TrainersController extends BaseControllerOperations<
    Trainer,
    CreateTrainerDTO,
    UpdateTrainerDTO,
    TrainersService
> {
    constructor(trainersService: TrainersService) {
        super(trainersService);
    }

    @Post()
    @RequirePermission('trainer:create')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: CREATE_TRAINER_SUMMARY })
    @ApiJsonApiCreatedResponse('trainers', TrainerResponseDTO)
    create(@Body() createDTO: CreateTrainerDTO, @CurrentUser() user: IUserSession) {
        return super.create(createDTO, user);
    }

    @Get()
    @RequirePermission('trainer:view')
    @ApiQuery({ type: QueryParamsDTO })
    @ApiJsonApiCollectionResponse('trainers', HttpStatus.OK, TrainerResponseDTO)
    findPaginated(@ValidatedQuery(QueryParamsDTO) query: QueryParamsDTO) {
        return super.findPaginated(query);          // ← ใช้ findPaginated ไม่ใช่ findAll
    }

    @Put(':id')                                     // ← ใช้ @Put ไม่ใช่ @Patch
    @RequirePermission('trainer:update')
    update(@Param('id') id: string, @Body() dto: UpdateTrainerDTO, @CurrentUser() user: IUserSession) {
        return super.update(id, dto, user);
    }
}
```

**กฎ HTTP Method:**
- `@Post` → Create
- `@Get` → Read (list ใช้ `findPaginated`, single ใช้ `findOne`)
- `@Put` → Update (full replacement) — **ห้ามใช้ `@Patch`**
- `@Delete` → Soft delete (เรียก `super.softDelete()`)

**กฎ Query Params:**
- ใช้ `@ValidatedQuery(QueryParamsDTO)` เสมอ — **ห้ามใช้ `@Query()` ตรงๆ**

---

## 7. Swagger / API Docs Convention

- **Swagger strings อยู่ใน `constants/<resource>.swagger.ts` เท่านั้น** — ห้ามเขียน inline ใน controller
- **Constants จริง (enum, allowed relations, codes) อยู่ใน `constants/<resource>.constants.ts`** — ห้ามปนกัน

```
modules/trainer/
├── constants/
│   ├── trainer.swagger.ts       ← summary strings สำหรับ @ApiOperation
│   └── trainer.constants.ts     ← TRAINER_ALLOWED_RELATIONS, enum values
```

### Relations ใน Scalar

เมื่อ service มี `allowedRelations` ที่ไม่ว่าง ต้องสร้าง:

```ts
// constants/trainer.constants.ts
export const TRAINER_ALLOWED_RELATIONS = ['addresses', 'packages'] as const;

// dto/trainer-query-params.dto.ts
export class TrainerQueryParamsDTO extends queryParamsWithRelations(TRAINER_ALLOWED_RELATIONS) {}
```

แล้วใช้ `TrainerQueryParamsDTO` ทั้งใน `@ApiQuery({ type })` และ `@ValidatedQuery()`

---

## 8. Database / Bounded Context Rules

- แต่ละ BC **เป็นเจ้าของ DB ของตัวเอง** — ห้าม cross-database join
- ข้อมูลข้าม BC ใช้ UUID column + TCP microservice เท่านั้น
- Register connection ด้วย `DatabaseModule.registerAsync(FitBinderDatabases.X)`
- Entity ต้องประกาศ `database:` ใน `@Entity({ name, database: FitBinderDatabases.X })`
- Inject repository ด้วย `@InjectRepository(Entity, FitBinderDatabases.X)`
- **Soft delete** ผ่าน `is_deleted` / `deleted_at` — ห้าม hard delete ยกเว้นมีเหตุผลชัดเจน
- **Migration** ต้องใช้ CLI เสมอ — ห้าม hand-write timestamp

---

## 9. Microservice Rules

- Inject BC อื่นผ่าน `AppMicroservice` enum:
  ```ts
  @Inject(AppMicroservice.Trainer.name) private trainer: ClientProxy
  ```
- **ห้ามใช้ `forwardRef()`** — ใช้ Facade หรือ EventEmitter แทน

---

## 10. File Structure ต่อ Module

```
modules/<resource>/
├── constants/
│   ├── <resource>.swagger.ts        ← Swagger strings เท่านั้น
│   └── <resource>.constants.ts      ← Enum, allowed relations (ถ้ามี)
├── controllers/
│   └── <resource>s.controller.ts
├── dto/
│   ├── create-<resource>.dto.ts
│   ├── update-<resource>.dto.ts
│   ├── <resource>-response.dto.ts
│   └── <resource>-query-params.dto.ts   ← ถ้ามี relations
├── entities/
│   └── <resource>.entity.ts
├── enum/
│   └── <resource>-<field>.enum.ts
└── services/
    └── <resource>s.service.ts
```

---

## 11. Frontend (`apps/web`)

- Import shared types จาก `@contracts` (`libs/contracts/src`) เท่านั้น
- **ห้าม import `@lib/common`** — จะดึง NestJS/TypeORM เข้า browser bundle
- Dev server proxy `/api/<bc>/*` → BC HTTP port ผ่าน `proxy.conf.json`
- Angular dev: `pnpm start:web` หรือ `pnpm --dir apps/web start`
