import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

import { IsISO8601 } from '@lib/common';

export class CreateAppointmentDTO {
    @ApiProperty({ description: 'รหัสเทรนเนอร์', example: '6f9619ff-8b86-d011-b42d-00cf4fc964ff' })
    @IsUUID()
    trainer_id: string;

    @ApiProperty({ description: 'รหัสลูกเทรน', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
    @IsUUID()
    trainee_id: string;

    @ApiProperty({ example: '2026-06-25T08:00:00+07:00' })
    @IsISO8601()
    scheduled_at: string;

    @ApiProperty({ example: 60 })
    @IsInt()
    @Min(1)
    duration_minutes: number;

    @ApiPropertyOptional({ example: 'Focus on lower body.', nullable: true })
    @IsOptional()
    @IsString()
    notes: string | null;
}
