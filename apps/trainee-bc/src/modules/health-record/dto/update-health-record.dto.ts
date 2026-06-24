import { PartialType } from '@nestjs/swagger';

import { CreateHealthRecordDTO } from './create-health-record.dto';

export class UpdateHealthRecordDTO extends PartialType(CreateHealthRecordDTO) {}
