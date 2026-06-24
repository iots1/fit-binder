import { IntersectionType } from '@nestjs/swagger';

import { BaseResponseDTO } from '@lib/common';

import { CreateHealthRecordDTO } from './create-health-record.dto';

export class HealthRecordResponseDTO extends IntersectionType(
    CreateHealthRecordDTO,
    BaseResponseDTO,
) {}
