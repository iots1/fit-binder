import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';

import { IsEnum, IsOptional } from 'class-validator';

import { PackageStatus } from '../enum/package-status.enum';
import { CreatePackageDTO } from './create-package.dto';

export class UpdatePackageDTO extends PartialType(CreatePackageDTO) {
    @ApiPropertyOptional({ enum: PackageStatus })
    @IsOptional()
    @IsEnum(PackageStatus)
    status: PackageStatus;
}
