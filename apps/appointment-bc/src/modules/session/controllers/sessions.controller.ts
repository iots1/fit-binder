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
    CREATE_SESSION_SUMMARY,
    DELETE_SESSION_SUMMARY,
    GET_SESSION_SUMMARY,
    GET_SESSIONS_SUMMARY,
    SESSION_ID_PARAM_DESCRIPTION,
    UPDATE_SESSION_SUMMARY,
} from '../constants/session.swagger';
import { CreateSessionDTO } from '../dto/create-session.dto';
import { SessionResponseDTO } from '../dto/session-response.dto';
import { UpdateSessionDTO } from '../dto/update-session.dto';
import { TrainingSession } from '../entities/session.entity';
import { SessionsService } from '../services/sessions.service';

@ApiTags('Training Sessions')
@ResourceType('training-sessions')
@Controller('training-sessions')
export class SessionsController extends BaseControllerOperations<
    TrainingSession,
    CreateSessionDTO,
    UpdateSessionDTO,
    SessionsService
> {
    constructor(sessionsService: SessionsService) {
        super(sessionsService);
    }

    @Post()
    @RequirePermission('training-session:create')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: CREATE_SESSION_SUMMARY })
    @ApiJsonApiCreatedResponse('training-sessions', SessionResponseDTO)
    create(
        @Body() createDTO: CreateSessionDTO,
        @CurrentUser() currentUser: IUserSession,
    ): Promise<TrainingSession> {
        return super.create(createDTO, currentUser);
    }

    @Get()
    @RequirePermission('training-session:view')
    @ApiOperation({ summary: GET_SESSIONS_SUMMARY })
    @ApiQuery({ type: QueryParamsDTO })
    @ApiJsonApiCollectionResponse('training-sessions', HttpStatus.OK, SessionResponseDTO)
    findPaginated(
        @ValidatedQuery(QueryParamsDTO) query: QueryParamsDTO,
    ): Promise<IResponsePaginatedService<TrainingSession[]>> {
        return super.findPaginated(query);
    }

    @Get(':id')
    @RequirePermission('training-session:view')
    @ApiOperation({ summary: GET_SESSION_SUMMARY })
    @ApiParam({ name: 'id', description: SESSION_ID_PARAM_DESCRIPTION })
    @ApiJsonApiResponse('training-sessions', HttpStatus.OK, SessionResponseDTO)
    findOne(@Param('id') id: string): Promise<TrainingSession> {
        return super.findOne(id);
    }

    @Put(':id')
    @RequirePermission('training-session:update')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: UPDATE_SESSION_SUMMARY })
    @ApiParam({ name: 'id', description: SESSION_ID_PARAM_DESCRIPTION })
    @ApiJsonApiResponse('training-sessions', HttpStatus.OK, SessionResponseDTO)
    update(
        @Param('id') id: string,
        @Body() updateDTO: UpdateSessionDTO,
        @CurrentUser() currentUser: IUserSession,
    ): Promise<TrainingSession> {
        return super.update(id, updateDTO, currentUser);
    }

    @Delete(':id')
    @RequirePermission('training-session:delete')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: DELETE_SESSION_SUMMARY })
    @ApiParam({ name: 'id', description: SESSION_ID_PARAM_DESCRIPTION })
    softDelete(@Param('id') id: string, @CurrentUser() currentUser: IUserSession): Promise<void> {
        return super.softDelete(id, currentUser);
    }
}
