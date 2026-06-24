import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDTO {
    @ApiProperty({ example: 'somchai' })
    @IsString()
    @MaxLength(100)
    username: string;

    @ApiProperty({ example: 'somchai@fitbinder.app' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'P@ssw0rd123', minLength: 8 })
    @IsString()
    @MinLength(8)
    @MaxLength(72)
    password: string;

    @ApiPropertyOptional({ example: 'Somchai Jaidee', nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(150)
    full_name: string | null;
}
