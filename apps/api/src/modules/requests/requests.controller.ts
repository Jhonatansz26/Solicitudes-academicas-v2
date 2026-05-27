import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { QueryRequestsDto } from './dto/query-requests.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: { id: string; email: string; role: string };
}

@ApiTags('Requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new request (DRAFT)' })
  @ApiResponse({ status: 201, description: 'Request created' })
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateRequestDto) {
    return this.requestsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List requests (student=own, staff=all)' })
  @ApiResponse({ status: 200, description: 'Paginated list of requests' })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'PENDING_DOCUMENTS', 'APPROVED', 'REJECTED', 'CANCELLED'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Req() req: AuthenticatedRequest, @Query() query: QueryRequestsDto) {
    const role = req.user.role as 'STUDENT' | 'STAFF' | 'COORDINATOR' | 'ADMIN';
    return this.requestsService.findAll(req.user.id, role, query);
  }

  @Get('types')
  @ApiOperation({ summary: 'List active request types' })
  @ApiResponse({ status: 200, description: 'List of request types' })
  getTypes() {
    return this.requestsService.getRequestTypes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get request detail with history' })
  @ApiResponse({ status: 200, description: 'Request detail' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  findOne(@Req() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    const role = req.user.role as 'STUDENT' | 'STAFF' | 'COORDINATOR' | 'ADMIN';
    return this.requestsService.findOne(id, req.user.id, role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit draft request' })
  @ApiResponse({ status: 200, description: 'Request updated' })
  @ApiResponse({ status: 403, description: 'Not owner or not in DRAFT' })
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRequestDto,
  ) {
    return this.requestsService.update(id, req.user.id, dto);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit draft request (DRAFT → SUBMITTED)' })
  @ApiResponse({ status: 200, description: 'Request submitted' })
  @ApiResponse({ status: 409, description: 'Not in DRAFT state' })
  submit(@Req() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.requestsService.submit(id, req.user.id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel request' })
  @ApiResponse({ status: 200, description: 'Request cancelled' })
  @ApiResponse({ status: 403, description: 'Already in final state' })
  cancel(@Req() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.requestsService.cancel(id, req.user.id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('STAFF', 'COORDINATOR', 'ADMIN')
  @ApiOperation({ summary: 'Change request status (staff/coordinator/admin)' })
  @ApiResponse({ status: 200, description: 'Status changed' })
  @ApiResponse({ status: 400, description: 'Comment required when rejecting' })
  @ApiResponse({ status: 403, description: 'Insufficient role permissions' })
  changeStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeStatusDto,
  ) {
    const role = req.user.role as 'STAFF' | 'COORDINATOR' | 'ADMIN';
    return this.requestsService.changeStatus(id, dto, req.user.id, role);
  }
}
