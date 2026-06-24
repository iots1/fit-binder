import { IntersectionType } from '@nestjs/swagger';

import { BaseResponseDTO } from '@lib/common';

import { CreateSessionDTO } from './create-session.dto';

export class SessionResponseDTO extends IntersectionType(CreateSessionDTO, BaseResponseDTO) {}
