import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import {
    ApiJsonApiCollectionResponse,
    ApiJsonApiCreatedResponse,
    ApiJsonApiResponse,
    BaseControllerOperations,
    CurrentUser,
    QueryParamsDTO,
    RequirePermission,
    ResourceType,
    ValidatedQuery,
    type IResponsePaginatedService,
    type IUserSession,
} from '@lib/common';

import {
    CREATE_PACKAGE_SUMMARY,
    DELETE_PACKAGE_SUMMARY,
    GET_PACKAGE_SUMMARY,
    GET_PACKAGES_SUMMARY,
    PACKAGE_ID_PARAM_DESCRIPTION,
    UPDATE_PACKAGE_SUMMARY,
} from '../constants/package.swagger';
import { CreatePackageDTO } from '../dto/create-package.dto';
import { PackageResponseDTO } from '../dto/package-response.dto';
import { UpdatePackageDTO } from '../dto/update-package.dto';
import { Package } from '../entities/package.entity';
import { PackagesService } from '../services/packages.service';

@ApiTags('Packages')
@ResourceType('packages')
@Controller('packages')
export class PackagesController extends BaseControllerOperations<
    Package,
    CreatePackageDTO,
    UpdatePackageDTO,
    PackagesService
> {
    constructor(packagesService: PackagesService) {
        super(packagesService);
    }

    @Post()
    @RequirePermission('package:create')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: CREATE_PACKAGE_SUMMARY })
    @ApiJsonApiCreatedResponse('packages', PackageResponseDTO)
    create(
        @Body() createDTO: CreatePackageDTO,
        @CurrentUser() currentUser: IUserSession,
    ): Promise<Package> {
        return super.create(createDTO, currentUser);
    }

    @Get()
    @RequirePermission('package:view')
    @ApiOperation({ summary: GET_PACKAGES_SUMMARY })
    @ApiQuery({ type: QueryParamsDTO })
    @ApiJsonApiCollectionResponse('packages', HttpStatus.OK, PackageResponseDTO)
    findPaginated(
        @ValidatedQuery(QueryParamsDTO) query: QueryParamsDTO,
    ): Promise<IResponsePaginatedService<Package[]>> {
        return super.findPaginated(query);
    }

    @Get(':id')
    @RequirePermission('package:view')
    @ApiOperation({ summary: GET_PACKAGE_SUMMARY })
    @ApiParam({ name: 'id', description: PACKAGE_ID_PARAM_DESCRIPTION })
    @ApiJsonApiResponse('packages', HttpStatus.OK, PackageResponseDTO)
    findOne(@Param('id') id: string): Promise<Package> {
        return super.findOne(id);
    }

    @Put(':id')
    @RequirePermission('package:update')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: UPDATE_PACKAGE_SUMMARY })
    @ApiParam({ name: 'id', description: PACKAGE_ID_PARAM_DESCRIPTION })
    @ApiJsonApiResponse('packages', HttpStatus.OK, PackageResponseDTO)
    update(
        @Param('id') id: string,
        @Body() updateDTO: UpdatePackageDTO,
        @CurrentUser() currentUser: IUserSession,
    ): Promise<Package> {
        return super.update(id, updateDTO, currentUser);
    }

    @Delete(':id')
    @RequirePermission('package:delete')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: DELETE_PACKAGE_SUMMARY })
    @ApiParam({ name: 'id', description: PACKAGE_ID_PARAM_DESCRIPTION })
    softDelete(@Param('id') id: string, @CurrentUser() currentUser: IUserSession): Promise<void> {
        return super.softDelete(id, currentUser);
    }
}
