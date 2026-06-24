/**
 * Per-Bounded-Context databases in the FitBinder platform. Each BC owns its own
 * physical PostgreSQL database (separated from the start). The enum value is both
 * the default database name and the TypeORM connection name used in
 * `@Entity({ database })`, `TypeOrmModule.forFeature([...], database)` and
 * `@InjectRepository(Entity, database)`.
 */
export enum FitBinderDatabases {
    AUTH = 'fit_binder_auth',
    TRAINER = 'fit_binder_trainer',
    TRAINEE = 'fit_binder_trainee',
    PACKAGE = 'fit_binder_package',
    APPOINTMENT = 'fit_binder_appointment',
}

/**
 * Maps each database to the env-var prefix carrying its connection settings,
 * e.g. TRAINER → `TRAINER_DB_HOST`, `TRAINER_DB_PORT`, `TRAINER_DB_NAME`, ...
 */
export const FIT_BINDER_DB_ENV_PREFIX: Record<FitBinderDatabases, string> = {
    [FitBinderDatabases.AUTH]: 'AUTH_DB',
    [FitBinderDatabases.TRAINER]: 'TRAINER_DB',
    [FitBinderDatabases.TRAINEE]: 'TRAINEE_DB',
    [FitBinderDatabases.PACKAGE]: 'PACKAGE_DB',
    [FitBinderDatabases.APPOINTMENT]: 'APPOINTMENT_DB',
};
