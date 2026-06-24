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
    CREATE_TRAINER_SUMMARY,
    DELETE_TRAINER_SUMMARY,
    GET_TRAINER_SUMMARY,
    GET_TRAINERS_SUMMARY,
    TRAINER_ID_PARAM_DESCRIPTION,
    UPDATE_TRAINER_SUMMARY,
} from '../constants/trainer.swagger';
import { CreateTrainerDTO } from '../dto/create-trainer.dto';
import { TrainerResponseDTO } from '../dto/trainer-response.dto';
import { UpdateTrainerDTO } from '../dto/update-trainer.dto';
import { Trainer } from '../entities/trainer.entity';
import { TrainersService } from '../services/trainers.service';

@ApiTags('Trainers')
@ResourceType('trainers')
@Controller('trainers')
export class TrainersController extends BaseControllerOperations<
    Trainer,
    CreateTrainerDTO,
    UpdateTrainerDTO,
    TrainersService
> {
    // Not `private readonly` — only passed to super()
    constructor(trainersService: TrainersService) {
        super(trainersService);
    }

    @Post()
    @RequirePermission('trainer:create')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: CREATE_TRAINER_SUMMARY })
    @ApiJsonApiCreatedResponse('trainers', TrainerResponseDTO)
    create(
        @Body() createDTO: CreateTrainerDTO,
        @CurrentUser() currentUser: IUserSession,
    ): Promise<Trainer> {
        return super.create(createDTO, currentUser);
    }

    @Get()
    @RequirePermission('trainer:view')
    @ApiOperation({ summary: GET_TRAINERS_SUMMARY })
    @ApiQuery({ type: QueryParamsDTO })
    @ApiJsonApiCollectionResponse('trainers', HttpStatus.OK, TrainerResponseDTO)
    findPaginated(
        @ValidatedQuery(QueryParamsDTO) query: QueryParamsDTO,
    ): Promise<IResponsePaginatedService<Trainer[]>> {
        return super.findPaginated(query);
    }

    @Get(':id')
    @RequirePermission('trainer:view')
    @ApiOperation({ summary: GET_TRAINER_SUMMARY })
    @ApiParam({ name: 'id', description: TRAINER_ID_PARAM_DESCRIPTION })
    @ApiJsonApiResponse('trainers', HttpStatus.OK, TrainerResponseDTO)
    findOne(@Param('id') id: string): Promise<Trainer> {
        return super.findOne(id);
    }

    @Put(':id')
    @RequirePermission('trainer:update')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: UPDATE_TRAINER_SUMMARY })
    @ApiParam({ name: 'id', description: TRAINER_ID_PARAM_DESCRIPTION })
    @ApiJsonApiResponse('trainers', HttpStatus.OK, TrainerResponseDTO)
    update(
        @Param('id') id: string,
        @Body() updateDTO: UpdateTrainerDTO,
        @CurrentUser() currentUser: IUserSession,
    ): Promise<Trainer> {
        return super.update(id, updateDTO, currentUser);
    }

    @Delete(':id')
    @RequirePermission('trainer:delete')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: DELETE_TRAINER_SUMMARY })
    @ApiParam({ name: 'id', description: TRAINER_ID_PARAM_DESCRIPTION })
    softDelete(@Param('id') id: string, @CurrentUser() currentUser: IUserSession): Promise<void> {
        return super.softDelete(id, currentUser);
    }
}
