import { Column, Entity, Index } from 'typeorm';

import { BaseEntity, FitBinderDatabases } from '@lib/common';

@Entity({ name: 'users', database: FitBinderDatabases.AUTH })
export class User extends BaseEntity {
    @Index({ unique: true })
    @Column({ type: 'varchar', length: 100, comment: 'ชื่อผู้ใช้' })
    username: string;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 150, comment: 'อีเมล' })
    email: string;

    @Column({ type: 'varchar', length: 255, comment: 'รหัสผ่าน (bcrypt hash)' })
    password_hash: string;

    @Column({ type: 'varchar', length: 150, nullable: true, comment: 'ชื่อ-นามสกุล' })
    full_name: string | null;

    @Column({ type: 'varchar', array: true, default: [], comment: 'บทบาท' })
    roles: string[];

    @Column({ type: 'boolean', default: true, comment: 'สถานะใช้งาน' })
    is_active: boolean;
}
