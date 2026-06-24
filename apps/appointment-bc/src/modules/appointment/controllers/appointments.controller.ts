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
    APPOINTMENT_ID_PARAM_DESCRIPTION,
    CREATE_APPOINTMENT_SUMMARY,
    DELETE_APPOINTMENT_SUMMARY,
    GET_APPOINTMENT_SUMMARY,
    GET_APPOINTMENTS_SUMMARY,
    UPDATE_APPOINTMENT_SUMMARY,
} from '../constants/appointment.swagger';
import { AppointmentResponseDTO } from '../dto/appointment-response.dto';
import { CreateAppointmentDTO } from '../dto/create-appointment.dto';
import { UpdateAppointmentDTO } from '../dto/update-appointment.dto';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentsService } from '../services/appointments.service';

@ApiTags('Appointments')
@ResourceType('appointments')
@Controller('appointments')
export class AppointmentsController extends BaseControllerOperations<
    Appointment,
    CreateAppointmentDTO,
    UpdateAppointmentDTO,
    AppointmentsService
> {
    constructor(appointmentsService: AppointmentsService) {
        super(appointmentsService);
    }

    @Post()
    @RequirePermission('appointment:create')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: CREATE_APPOINTMENT_SUMMARY })
    @ApiJsonApiCreatedResponse('appointments', AppointmentResponseDTO)
    create(
        @Body() createDTO: CreateAppointmentDTO,
        @CurrentUser() currentUser: IUserSession,
    ): Promise<Appointment> {
        return super.create(createDTO, currentUser);
    }

    @Get()
    @RequirePermission('appointment:view')
    @ApiOperation({ summary: GET_APPOINTMENTS_SUMMARY })
    @ApiQuery({ type: QueryParamsDTO })
    @ApiJsonApiCollectionResponse('appointments', HttpStatus.OK, AppointmentResponseDTO)
    findPaginated(
        @ValidatedQuery(QueryParamsDTO) query: QueryParamsDTO,
    ): Promise<IResponsePaginatedService<Appointment[]>> {
        return super.findPaginated(query);
    }

    @Get(':id')
    @RequirePermission('appointment:view')
    @ApiOperation({ summary: GET_APPOINTMENT_SUMMARY })
    @ApiParam({ name: 'id', description: APPOINTMENT_ID_PARAM_DESCRIPTION })
    @ApiJsonApiResponse('appointments', HttpStatus.OK, AppointmentResponseDTO)
    findOne(@Param('id') id: string): Promise<Appointment> {
        return super.findOne(id);
    }

    @Put(':id')
    @RequirePermission('appointment:update')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: UPDATE_APPOINTMENT_SUMMARY })
    @ApiParam({ name: 'id', description: APPOINTMENT_ID_PARAM_DESCRIPTION })
    @ApiJsonApiResponse('appointments', HttpStatus.OK, AppointmentResponseDTO)
    update(
        @Param('id') id: string,
        @Body() updateDTO: UpdateAppointmentDTO,
        @CurrentUser() currentUser: IUserSession,
    ): Promise<Appointment> {
        return super.update(id, updateDTO, currentUser);
    }

    @Delete(':id')
    @RequirePermission('appointment:delete')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: DELETE_APPOINTMENT_SUMMARY })
    @ApiParam({ name: 'id', description: APPOINTMENT_ID_PARAM_DESCRIPTION })
    softDelete(@Param('id') id: string, @CurrentUser() currentUser: IUserSession): Promise<void> {
        return super.softDelete(id, currentUser);
    }
}
