import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { FitBinderDatabases } from '@lib/common';
import { ConfigService } from '@lib/config';

import { LoginDTO } from '../dto/login.dto';
import { RegisterDTO } from '../dto/register.dto';
import { User } from '../entities/user.entity';

export interface AuthTokens {
    access_token: string;
    refresh_token: string;
}

@Injectable()
export class AuthService {
    private readonly saltRounds = 10;

    constructor(
        @InjectRepository(User, FitBinderDatabases.AUTH)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async register(dto: RegisterDTO): Promise<Omit<User, 'password_hash'>> {
        const existing = await this.userRepository.findOne({
            where: [{ username: dto.username }, { email: dto.email }],
        });
        if (existing) {
            throw new ConflictException('Username or email already in use');
        }

        const user = this.userRepository.create({
            username: dto.username,
            email: dto.email,
            full_name: dto.full_name,
            password_hash: await bcrypt.hash(dto.password, this.saltRounds),
            roles: ['member'],
        });
        const saved = await this.userRepository.save(user);
        return this.stripPassword(saved);
    }

    async login(dto: LoginDTO): Promise<AuthTokens> {
        const user = await this.userRepository.findOne({
            where: [{ username: dto.username }, { email: dto.username }],
        });
        if (!user || !user.is_active) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const valid = await bcrypt.compare(dto.password, user.password_hash);
        if (!valid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.issueTokens(user);
    }

    private issueTokens(user: User): AuthTokens {
        const payload = { sub: user.id, username: user.username, roles: user.roles };
        const accessOptions = {
            expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m',
        } as JwtSignOptions;
        const refreshOptions = {
            expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
        } as JwtSignOptions;

        return {
            access_token: this.jwtService.sign(payload, accessOptions),
            refresh_token: this.jwtService.sign({ sub: user.id }, refreshOptions),
        };
    }

    private stripPassword(user: User): Omit<User, 'password_hash'> {
        const { password_hash: _omit, ...rest } = user;
        return rest;
    }
}
