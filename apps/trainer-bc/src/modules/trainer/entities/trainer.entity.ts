import { Column, Entity, Index } from 'typeorm';

import { BaseEntity, FitBinderDatabases, Gender } from '@lib/common';

import { TrainerSpecialty } from '../enum/trainer-specialty.enum';
import { TrainerStatus } from '../enum/trainer-status.enum';

@Entity({ name: 'trainers', database: FitBinderDatabases.TRAINER })
export class Trainer extends BaseEntity {
    @Column({ type: 'varchar', length: 100, comment: 'ชื่อ' })
    first_name: string;

    @Column({ type: 'varchar', length: 100, comment: 'นามสกุล' })
    last_name: string;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 150, comment: 'อีเมล (ใช้ติดต่อ)' })
    email: string;

    @Column({
        type: 'varchar',
        length: 20,
        nullable: true,
        comment: 'เบอร์โทรศัพท์',
    })
    phone: string | null;

    @Column({ type: 'enum', enum: Gender, nullable: true, comment: 'เพศ' })
    gender: Gender | null;

    @Column({
        type: 'enum',
        enum: TrainerSpecialty,
        array: true,
        default: [],
        comment: 'ความเชี่ยวชาญ',
    })
    specialties: TrainerSpecialty[];

    @Column({ type: 'text', nullable: true, comment: 'ประวัติ/แนะนำตัว' })
    bio: string | null;

    @Column({
        type: 'numeric',
        precision: 4,
        scale: 1,
        default: 0,
        comment: 'จำนวนปีประสบการณ์',
    })
    years_of_experience: number;

    @Column({
        type: 'enum',
        enum: TrainerStatus,
        default: TrainerStatus.ACTIVE,
        comment: 'สถานะเทรนเนอร์',
    })
    status: TrainerStatus;
}
