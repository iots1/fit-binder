import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';

import { IsEnum, IsOptional } from 'class-validator';

import { SessionStatus } from '../enum/session-status.enum';
import { CreateSessionDTO } from './create-session.dto';

export class UpdateSessionDTO extends PartialType(CreateSessionDTO) {
    @ApiPropertyOptional({ enum: SessionStatus })
    @IsOptional()
    @IsEnum(SessionStatus)
    status: SessionStatus;
}
