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
    CREATE_HEALTH_RECORD_SUMMARY,
    DELETE_HEALTH_RECORD_SUMMARY,
    GET_HEALTH_RECORD_SUMMARY,
    GET_HEALTH_RECORDS_SUMMARY,
    HEALTH_RECORD_ID_PARAM_DESCRIPTION,
    UPDATE_HEALTH_RECORD_SUMMARY,
} from '../constants/health-record.swagger';
import { CreateHealthRecordDTO } from '../dto/create-health-record.dto';
import { HealthRecordResponseDTO } from '../dto/health-record-response.dto';
import { UpdateHealthRecordDTO } from '../dto/update-health-record.dto';
import { HealthRecord } from '../entities/health-record.entity';
import { HealthRecordsService } from '../services/health-records.service';

@ApiTags('Health Records')
@ResourceType('health-records')
@Controller('health-records')
export class HealthRecordsController extends BaseControllerOperations<
    HealthRecord,
    CreateHealthRecordDTO,
    UpdateHealthRecordDTO,
    HealthRecordsService
> {
    constructor(healthRecordsService: HealthRecordsService) {
        super(healthRecordsService);
    }

    @Post()
    @RequirePermission('health-record:create')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: CREATE_HEALTH_RECORD_SUMMARY })
    @ApiJsonApiCreatedResponse('health-records', HealthRecordResponseDTO)
    create(
        @Body() createDTO: CreateHealthRecordDTO,
        @CurrentUser() currentUser: IUserSession,
    ): Promise<HealthRecord> {
        return super.create(createDTO, currentUser);
    }

    @Get()
    @RequirePermission('health-record:view')
    @ApiOperation({ summary: GET_HEALTH_RECORDS_SUMMARY })
    @ApiQuery({ type: QueryParamsDTO })
    @ApiJsonApiCollectionResponse('health-records', HttpStatus.OK, HealthRecordResponseDTO)
    findPaginated(
        @ValidatedQuery(QueryParamsDTO) query: QueryParamsDTO,
    ): Promise<IResponsePaginatedService<HealthRecord[]>> {
        return super.findPaginated(query);
    }

    @Get(':id')
    @RequirePermission('health-record:view')
    @ApiOperation({ summary: GET_HEALTH_RECORD_SUMMARY })
    @ApiParam({ name: 'id', description: HEALTH_RECORD_ID_PARAM_DESCRIPTION })
    @ApiJsonApiResponse('health-records', HttpStatus.OK, HealthRecordResponseDTO)
    findOne(@Param('id') id: string): Promise<HealthRecord> {
        return super.findOne(id);
    }

    @Put(':id')
    @RequirePermission('health-record:update')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: UPDATE_HEALTH_RECORD_SUMMARY })
    @ApiParam({ name: 'id', description: HEALTH_RECORD_ID_PARAM_DESCRIPTION })
    @ApiJsonApiResponse('health-records', HttpStatus.OK, HealthRecordResponseDTO)
    update(
        @Param('id') id: string,
        @Body() updateDTO: UpdateHealthRecordDTO,
        @CurrentUser() currentUser: IUserSession,
    ): Promise<HealthRecord> {
        return super.update(id, updateDTO, currentUser);
    }

    @Delete(':id')
    @RequirePermission('health-record:delete')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: DELETE_HEALTH_RECORD_SUMMARY })
    @ApiParam({ name: 'id', description: HEALTH_RECORD_ID_PARAM_DESCRIPTION })
    softDelete(@Param('id') id: string, @CurrentUser() currentUser: IUserSession): Promise<void> {
        return super.softDelete(id, currentUser);
    }
}
