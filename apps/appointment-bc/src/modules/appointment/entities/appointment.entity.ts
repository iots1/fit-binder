import { Column, Entity, Index } from 'typeorm';

import { BaseEntity, FitBinderDatabases } from '@lib/common';

import { AppointmentStatus } from '../enum/appointment-status.enum';

@Entity({ name: 'appointments', database: FitBinderDatabases.APPOINTMENT })
@Index('idx_appointments_trainer_id', ['trainer_id'])
@Index('idx_appointments_trainee_id', ['trainee_id'])
export class Appointment extends BaseEntity {
    @Column({ type: 'uuid', comment: 'รหัสเทรนเนอร์ (FK → trainers.id)' })
    trainer_id: string;

    @Column({ type: 'uuid', comment: 'รหัสลูกเทรน (FK → trainees.id)' })
    trainee_id: string;

    @Column({ type: 'timestamptz', comment: 'วันเวลานัดหมาย' })
    scheduled_at: Date;

    @Column({ type: 'int', default: 60, comment: 'ระยะเวลา (นาที)' })
    duration_minutes: number;

    @Column({
        type: 'enum',
        enum: AppointmentStatus,
        default: AppointmentStatus.SCHEDULED,
        comment: 'สถานะนัดหมาย',
    })
    status: AppointmentStatus;

    @Column({ type: 'text', nullable: true, comment: 'หมายเหตุ' })
    notes: string | null;
}
