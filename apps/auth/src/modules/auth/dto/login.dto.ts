import { ApiProperty } from '@nestjs/swagger';

import { IsString } from 'class-validator';

export class LoginDTO {
    @ApiProperty({ example: 'somchai', description: 'Username or email' })
    @IsString()
    username: string;

    @ApiProperty({ example: 'P@ssw0rd123' })
    @IsString()
    password: string;
}
