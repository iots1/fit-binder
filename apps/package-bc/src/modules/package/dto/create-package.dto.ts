import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsInt, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreatePackageDTO {
    @ApiProperty({ example: '12-Session Strength Program' })
    @IsString()
    @MaxLength(150)
    name: string;

    @ApiPropertyOptional({
        example: 'Twelve personal training sessions over 3 months.',
        nullable: true,
    })
    @IsOptional()
    @IsString()
    description: string | null;

    @ApiProperty({ type: Number, example: 9000 })
    @IsNumber()
    price: number;

    @ApiProperty({ example: 12 })
    @IsInt()
    @IsPositive()
    session_count: number;

    @ApiProperty({ example: 90 })
    @IsInt()
    @IsPositive()
    duration_days: number;
}
