import { Column, Entity, Index } from 'typeorm';

import { BaseEntity, FitBinderDatabases, NumericTransformer } from '@lib/common';

import { PurchaseStatus } from '../enum/purchase-status.enum';

@Entity({ name: 'purchases', database: FitBinderDatabases.PACKAGE })
@Index('idx_purchases_trainee_id', ['trainee_id'])
@Index('idx_purchases_package_id', ['package_id'])
export class Purchase extends BaseEntity {
    @Column({ type: 'uuid', comment: 'รหัสลูกเทรน (FK → trainees.id)' })
    trainee_id: string;

    @Column({ type: 'uuid', comment: 'รหัสแพ็กเกจ (FK → packages.id)' })
    package_id: string;

    @Column({
        type: 'numeric',
        precision: 10,
        scale: 2,
        comment: 'ราคาที่จ่ายจริง (บาท)',
        transformer: new NumericTransformer(),
    })
    price_paid: number;

    @Column({ type: 'timestamptz', comment: 'วันที่ซื้อ' })
    purchased_at: Date;

    @Column({ type: 'timestamptz', nullable: true, comment: 'วันหมดอายุแพ็กเกจ' })
    expires_at: Date | null;

    @Column({ type: 'int', comment: 'จำนวนเซสชันคงเหลือ' })
    sessions_remaining: number;

    @Column({
        type: 'enum',
        enum: PurchaseStatus,
        default: PurchaseStatus.ACTIVE,
        comment: 'สถานะการซื้อ',
    })
    status: PurchaseStatus;
}
