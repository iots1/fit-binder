import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsInt, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

import { IsISO8601 } from '@lib/common';

export class CreatePurchaseDTO {
    @ApiProperty({ description: 'รหัสลูกเทรน', example: '6f9619ff-8b86-d011-b42d-00cf4fc964ff' })
    @IsUUID()
    trainee_id: string;

    @ApiProperty({ description: 'รหัสแพ็กเกจ', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
    @IsUUID()
    package_id: string;

    @ApiProperty({ type: Number, example: 9000 })
    @IsNumber()
    price_paid: number;

    @ApiProperty({ example: '2026-06-24T10:00:00+07:00' })
    @IsISO8601()
    purchased_at: string;

    @ApiPropertyOptional({ example: '2026-09-22T10:00:00+07:00', nullable: true })
    @IsOptional()
    @IsISO8601()
    expires_at: string | null;

    @ApiProperty({ example: 12 })
    @IsInt()
    @Min(0)
    sessions_remaining: number;
}
