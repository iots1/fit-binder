import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsArray, IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { Gender } from '@lib/common';

import { TrainerSpecialty } from '../enum/trainer-specialty.enum';

/**
 * Create payload for a trainer.
 * Per project convention DTO properties never use the `?` optional marker:
 * nullable entity columns are typed `T | null` with `@IsOptional()`.
 */
export class CreateTrainerDTO {
    @ApiProperty({ example: 'Somchai' })
    @IsString()
    @MaxLength(100)
    first_name: string;

    @ApiProperty({ example: 'Jaidee' })
    @IsString()
    @MaxLength(100)
    last_name: string;

    @ApiProperty({ example: 'somchai.trainer@fitbinder.app' })
    @IsEmail()
    email: string;

    @ApiPropertyOptional({ example: '0812345678', nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone: string | null;

    @ApiPropertyOptional({ enum: Gender, nullable: true })
    @IsOptional()
    @IsEnum(Gender)
    gender: Gender | null;

    @ApiPropertyOptional({ enum: TrainerSpecialty, isArray: true })
    @IsOptional()
    @IsArray()
    @IsEnum(TrainerSpecialty, { each: true })
    specialties: TrainerSpecialty[];

    @ApiPropertyOptional({
        example: 'Certified strength & conditioning coach.',
        nullable: true,
    })
    @IsOptional()
    @IsString()
    bio: string | null;
}
