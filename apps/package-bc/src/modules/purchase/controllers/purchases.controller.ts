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
    CREATE_PURCHASE_SUMMARY,
    DELETE_PURCHASE_SUMMARY,
    GET_PURCHASE_SUMMARY,
    GET_PURCHASES_SUMMARY,
    PURCHASE_ID_PARAM_DESCRIPTION,
    UPDATE_PURCHASE_SUMMARY,
} from '../constants/purchase.swagger';
import { CreatePurchaseDTO } from '../dto/create-purchase.dto';
import { PurchaseResponseDTO } from '../dto/purchase-response.dto';
import { UpdatePurchaseDTO } from '../dto/update-purchase.dto';
import { Purchase } from '../entities/purchase.entity';
import { PurchasesService } from '../services/purchases.service';

@ApiTags('Purchases')
@ResourceType('purchases')
@Controller('purchases')
export class PurchasesController extends BaseControllerOperations<
    Purchase,
    CreatePurchaseDTO,
    UpdatePurchaseDTO,
    PurchasesService
> {
    constructor(purchasesService: PurchasesService) {
        super(purchasesService);
    }

    @Post()
    @RequirePermission('purchase:create')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: CREATE_PURCHASE_SUMMARY })
    @ApiJsonApiCreatedResponse('purchases', PurchaseResponseDTO)
    create(
        @Body() createDTO: CreatePurchaseDTO,
        @CurrentUser() currentUser: IUserSession,
    ): Promise<Purchase> {
        return super.create(createDTO, currentUser);
    }

    @Get()
    @RequirePermission('purchase:view')
    @ApiOperation({ summary: GET_PURCHASES_SUMMARY })
    @ApiQuery({ type: QueryParamsDTO })
    @ApiJsonApiCollectionResponse('purchases', HttpStatus.OK, PurchaseResponseDTO)
    findPaginated(
        @ValidatedQuery(QueryParamsDTO) query: QueryParamsDTO,
    ): Promise<IResponsePaginatedService<Purchase[]>> {
        return super.findPaginated(query);
    }

    @Get(':id')
    @RequirePermission('purchase:view')
    @ApiOperation({ summary: GET_PURCHASE_SUMMARY })
    @ApiParam({ name: 'id', description: PURCHASE_ID_PARAM_DESCRIPTION })
    @ApiJsonApiResponse('purchases', HttpStatus.OK, PurchaseResponseDTO)
    findOne(@Param('id') id: string): Promise<Purchase> {
        return super.findOne(id);
    }

    @Put(':id')
    @RequirePermission('purchase:update')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: UPDATE_PURCHASE_SUMMARY })
    @ApiParam({ name: 'id', description: PURCHASE_ID_PARAM_DESCRIPTION })
    @ApiJsonApiResponse('purchases', HttpStatus.OK, PurchaseResponseDTO)
    update(
        @Param('id') id: string,
        @Body() updateDTO: UpdatePurchaseDTO,
        @CurrentUser() currentUser: IUserSession,
    ): Promise<Purchase> {
        return super.update(id, updateDTO, currentUser);
    }

    @Delete(':id')
    @RequirePermission('purchase:delete')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: DELETE_PURCHASE_SUMMARY })
    @ApiParam({ name: 'id', description: PURCHASE_ID_PARAM_DESCRIPTION })
    softDelete(@Param('id') id: string, @CurrentUser() currentUser: IUserSession): Promise<void> {
        return super.softDelete(id, currentUser);
    }
}
