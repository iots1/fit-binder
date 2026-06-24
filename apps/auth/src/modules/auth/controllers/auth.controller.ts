import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '@lib/common';

import { LoginDTO } from '../dto/login.dto';
import { RegisterDTO } from '../dto/register.dto';
import { User } from '../entities/user.entity';
import { AuthService, type AuthTokens } from '../services/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a new user' })
    register(@Body() dto: RegisterDTO): Promise<Omit<User, 'password_hash'>> {
        return this.authService.register(dto);
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login and receive access/refresh tokens' })
    login(@Body() dto: LoginDTO): Promise<AuthTokens> {
        return this.authService.login(dto);
    }
}
