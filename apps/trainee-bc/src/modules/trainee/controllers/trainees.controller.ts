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
    CREATE_TRAINEE_SUMMARY,
    DELETE_TRAINEE_SUMMARY,
    GET_TRAINEE_SUMMARY,
    GET_TRAINEES_SUMMARY,
    TRAINEE_ID_PARAM_DESCRIPTION,
    UPDATE_TRAINEE_SUMMARY,
} from '../constants/trainee.swagger';
import { CreateTraineeDTO } from '../dto/create-trainee.dto';
import { TraineeResponseDTO } from '../dto/trainee-response.dto';
import { UpdateTraineeDTO } from '../dto/update-trainee.dto';
import { Trainee } from '../entities/trainee.entity';
import { TraineesService } from '../services/trainees.service';

@ApiTags('Trainees')
@ResourceType('trainees')
@Controller('trainees')
export class TraineesController extends BaseControllerOperations<
    Trainee,
    CreateTraineeDTO,
    UpdateTraineeDTO,
    TraineesService
> {
    constructor(traineesService: TraineesService) {
        super(traineesService);
    }

    @Post()
    @RequirePermission('trainee:create')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: CREATE_TRAINEE_SUMMARY })
    @ApiJsonApiCreatedResponse('trainees', TraineeResponseDTO)
    create(
        @Body() createDTO: CreateTraineeDTO,
        @CurrentUser() currentUser: IUserSession,
    ): Promise<Trainee> {
        return super.create(createDTO, currentUser);
    }

    @Get()
    @RequirePermission('trainee:view')
    @ApiOperation({ summary: GET_TRAINEES_SUMMARY })
    @ApiQuery({ type: QueryParamsDTO })
    @ApiJsonApiCollectionResponse('trainees', HttpStatus.OK, TraineeResponseDTO)
    findPaginated(
        @ValidatedQuery(QueryParamsDTO) query: QueryParamsDTO,
    ): Promise<IResponsePaginatedService<Trainee[]>> {
        return super.findPaginated(query);
    }

    @Get(':id')
    @RequirePermission('trainee:view')
    @ApiOperation({ summary: GET_TRAINEE_SUMMARY })
    @ApiParam({ name: 'id', description: TRAINEE_ID_PARAM_DESCRIPTION })
    @ApiJsonApiResponse('trainees', HttpStatus.OK, TraineeResponseDTO)
    findOne(@Param('id') id: string): Promise<Trainee> {
        return super.findOne(id);
    }

    @Put(':id')
    @RequirePermission('trainee:update')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: UPDATE_TRAINEE_SUMMARY })
    @ApiParam({ name: 'id', description: TRAINEE_ID_PARAM_DESCRIPTION })
    @ApiJsonApiResponse('trainees', HttpStatus.OK, TraineeResponseDTO)
    update(
        @Param('id') id: string,
        @Body() updateDTO: UpdateTraineeDTO,
        @CurrentUser() currentUser: IUserSession,
    ): Promise<Trainee> {
        return super.update(id, updateDTO, currentUser);
    }

    @Delete(':id')
    @RequirePermission('trainee:delete')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: DELETE_TRAINEE_SUMMARY })
    @ApiParam({ name: 'id', description: TRAINEE_ID_PARAM_DESCRIPTION })
    softDelete(@Param('id') id: string, @CurrentUser() currentUser: IUserSession): Promise<void> {
        return super.softDelete(id, currentUser);
    }
}
