import { Column, Entity, Index } from 'typeorm';

import { BaseEntity, FitBinderDatabases } from '@lib/common';

import { SessionStatus } from '../enum/session-status.enum';

/**
 * A completed (or missed) training session — the trainee's training history.
 */
@Entity({ name: 'training_sessions', database: FitBinderDatabases.APPOINTMENT })
@Index('idx_training_sessions_trainee_id', ['trainee_id'])
@Index('idx_training_sessions_appointment_id', ['appointment_id'])
export class TrainingSession extends BaseEntity {
    @Column({ type: 'uuid', nullable: true, comment: 'รหัสนัดหมายต้นทาง (FK → appointments.id)' })
    appointment_id: string | null;

    @Column({ type: 'uuid', comment: 'รหัสเทรนเนอร์ (FK → trainers.id)' })
    trainer_id: string;

    @Column({ type: 'uuid', comment: 'รหัสลูกเทรน (FK → trainees.id)' })
    trainee_id: string;

    @Column({ type: 'timestamptz', comment: 'วันเวลาที่เทรน' })
    session_at: Date;

    @Column({
        type: 'enum',
        enum: SessionStatus,
        default: SessionStatus.COMPLETED,
        comment: 'สถานะเซสชัน',
    })
    status: SessionStatus;

    @Column({ type: 'text', nullable: true, comment: 'สรุปการเทรน / ท่าที่ทำ' })
    summary: string | null;
}
