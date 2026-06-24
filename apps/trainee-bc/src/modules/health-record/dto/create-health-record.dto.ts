import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

import { IsISO8601 } from '@lib/common';

export class CreateHealthRecordDTO {
    @ApiProperty({ description: 'รหัสลูกเทรน', example: '6f9619ff-8b86-d011-b42d-00cf4fc964ff' })
    @IsUUID()
    trainee_id: string;

    @ApiProperty({ example: '2026-06-24T09:00:00+07:00' })
    @IsISO8601()
    recorded_at: string;

    @ApiPropertyOptional({ type: Number, example: 68.5, nullable: true })
    @IsOptional()
    @IsNumber()
    weight_kg: number | null;

    @ApiPropertyOptional({ type: Number, example: 170, nullable: true })
    @IsOptional()
    @IsNumber()
    height_cm: number | null;

    @ApiPropertyOptional({ type: Number, example: 22.4, nullable: true })
    @IsOptional()
    @IsNumber()
    body_fat_percentage: number | null;

    @ApiPropertyOptional({ example: 'No injuries. Mild knee discomfort.', nullable: true })
    @IsOptional()
    @IsString()
    notes: string | null;
}
