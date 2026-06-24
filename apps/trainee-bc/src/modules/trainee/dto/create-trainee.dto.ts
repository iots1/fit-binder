import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { Gender, IsISO8601 } from '@lib/common';

export class CreateTraineeDTO {
    @ApiProperty({ example: 'Malee' })
    @IsString()
    @MaxLength(100)
    first_name: string;

    @ApiProperty({ example: 'Rakdee' })
    @IsString()
    @MaxLength(100)
    last_name: string;

    @ApiProperty({ example: 'malee.trainee@fitbinder.app' })
    @IsEmail()
    email: string;

    @ApiPropertyOptional({ example: '0898765432', nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone: string | null;

    @ApiPropertyOptional({ enum: Gender, nullable: true })
    @IsOptional()
    @IsEnum(Gender)
    gender: Gender | null;

    @ApiPropertyOptional({ example: '1995-06-15T00:00:00+07:00', nullable: true })
    @IsOptional()
    @IsISO8601()
    date_of_birth: string | null;
}
