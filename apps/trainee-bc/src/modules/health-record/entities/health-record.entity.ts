import { Column, Entity, Index } from 'typeorm';

import { BaseEntity, FitBinderDatabases, NumericTransformer } from '@lib/common';

@Entity({ name: 'health_records', database: FitBinderDatabases.TRAINEE })
@Index('idx_health_records_trainee_id', ['trainee_id'])
export class HealthRecord extends BaseEntity {
    @Column({ type: 'uuid', comment: 'รหัสลูกเทรน (FK → trainees.id)' })
    trainee_id: string;

    @Column({ type: 'timestamptz', comment: 'วันที่บันทึกข้อมูล' })
    recorded_at: Date;

    @Column({
        type: 'numeric',
        precision: 5,
        scale: 2,
        nullable: true,
        comment: 'น้ำหนัก (กก.)',
        transformer: new NumericTransformer(),
    })
    weight_kg: number | null;

    @Column({
        type: 'numeric',
        precision: 5,
        scale: 2,
        nullable: true,
        comment: 'ส่วนสูง (ซม.)',
        transformer: new NumericTransformer(),
    })
    height_cm: number | null;

    @Column({
        type: 'numeric',
        precision: 5,
        scale: 2,
        nullable: true,
        comment: 'เปอร์เซ็นต์ไขมัน',
        transformer: new NumericTransformer(),
    })
    body_fat_percentage: number | null;

    @Column({ type: 'text', nullable: true, comment: 'หมายเหตุ / อาการ / ประวัติสุขภาพ' })
    notes: string | null;
}
