import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsOptional, IsString, IsUUID } from 'class-validator';

import { IsISO8601 } from '@lib/common';

export class CreateSessionDTO {
    @ApiPropertyOptional({ description: 'รหัสนัดหมายต้นทาง', nullable: true })
    @IsOptional()
    @IsUUID()
    appointment_id: string | null;

    @ApiProperty({ description: 'รหัสเทรนเนอร์', example: '6f9619ff-8b86-d011-b42d-00cf4fc964ff' })
    @IsUUID()
    trainer_id: string;

    @ApiProperty({ description: 'รหัสลูกเทรน', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
    @IsUUID()
    trainee_id: string;

    @ApiProperty({ example: '2026-06-25T08:00:00+07:00' })
    @IsISO8601()
    session_at: string;

    @ApiPropertyOptional({ example: 'Squats 5x5, deadlift 3x5.', nullable: true })
    @IsOptional()
    @IsString()
    summary: string | null;
}
