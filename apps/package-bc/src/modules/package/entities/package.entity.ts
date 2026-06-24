import { Column, Entity } from 'typeorm';

import { BaseEntity, FitBinderDatabases, NumericTransformer } from '@lib/common';

import { PackageStatus } from '../enum/package-status.enum';

@Entity({ name: 'packages', database: FitBinderDatabases.PACKAGE })
export class Package extends BaseEntity {
    @Column({ type: 'varchar', length: 150, comment: 'ชื่อแพ็กเกจ' })
    name: string;

    @Column({ type: 'text', nullable: true, comment: 'รายละเอียดแพ็กเกจ' })
    description: string | null;

    @Column({
        type: 'numeric',
        precision: 10,
        scale: 2,
        comment: 'ราคา (บาท)',
        transformer: new NumericTransformer(),
    })
    price: number;

    @Column({ type: 'int', comment: 'จำนวนเซสชันที่ได้รับ' })
    session_count: number;

    @Column({ type: 'int', comment: 'อายุแพ็กเกจ (วัน)' })
    duration_days: number;

    @Column({
        type: 'enum',
        enum: PackageStatus,
        default: PackageStatus.ACTIVE,
        comment: 'สถานะแพ็กเกจ',
    })
    status: PackageStatus;
}
