import { Column, Entity, Index } from 'typeorm';

import { BaseEntity, FitBinderDatabases, Gender } from '@lib/common';

import { TraineeStatus } from '../enum/trainee-status.enum';

@Entity({ name: 'trainees', database: FitBinderDatabases.TRAINEE })
export class Trainee extends BaseEntity {
    @Column({ type: 'varchar', length: 100, comment: 'ชื่อ' })
    first_name: string;

    @Column({ type: 'varchar', length: 100, comment: 'นามสกุล' })
    last_name: string;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 150, comment: 'อีเมล' })
    email: string;

    @Column({ type: 'varchar', length: 20, nullable: true, comment: 'เบอร์โทรศัพท์' })
    phone: string | null;

    @Column({ type: 'enum', enum: Gender, nullable: true, comment: 'เพศ' })
    gender: Gender | null;

    @Column({ type: 'timestamptz', nullable: true, comment: 'วันเกิด' })
    date_of_birth: Date | null;

    @Column({
        type: 'enum',
        enum: TraineeStatus,
        default: TraineeStatus.ACTIVE,
        comment: 'สถานะลูกเทรน',
    })
    status: TraineeStatus;
}
