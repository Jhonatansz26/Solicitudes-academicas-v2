import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { CreateRequestTypeDto } from './dto/create-request-type.dto';
import { UpdateRequestTypeDto } from './dto/update-request-type.dto';
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
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new request (DRAFT)',
    description: 'Creates a new academic request in DRAFT status. The student can edit and submit it later.',
  })
  @ApiCreatedResponse({ description: 'Request created successfully' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateRequestDto) {
    return this.requestsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List requests with pagination',
    description: 'Students see only their own requests. Staff, coordinators, and admins see all requests.',
  })
  @ApiOkResponse({ description: 'Paginated list of requests' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'PENDING_DOCUMENTS', 'APPROVED', 'REJECTED', 'CANCELLED'] })
  @ApiQuery({ name: 'requestTypeId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  findAll(@Req() req: AuthenticatedRequest, @Query() query: QueryRequestsDto) {
    const role = req.user.role as 'STUDENT' | 'STAFF' | 'COORDINATOR' | 'ADMIN';
    return this.requestsService.findAll(req.user.id, role, query);
  }

  @Get('types')
  @ApiOperation({
    summary: 'List active request types',
    description: 'Returns all active request types (Certificado, Homologación, etc.) available for creating requests.',
  })
  @ApiOkResponse({ description: 'List of active request types' })
  getTypes() {
    return this.requestsService.getRequestTypes();
  }

  @Get('types/all')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'List all request types (admin)',
    description: 'Returns all request types including inactive ones. Admin only.',
  })
  @ApiOkResponse({ description: 'List of all request types' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Insufficient role permissions' })
  getAllTypes() {
    return this.requestsService.getAllRequestTypes();
  }

  @Post('types')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Create a request type',
    description: 'Creates a new request type. Admin only.',
  })
  @ApiCreatedResponse({ description: 'Request type created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Insufficient role permissions' })
  @ApiConflictResponse({ description: 'Request type name already exists' })
  createType(@Body() dto: CreateRequestTypeDto) {
    return this.requestsService.createRequestType(dto);
  }

  @Patch('types/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Update a request type',
    description: 'Updates an existing request type. Admin only.',
  })
  @ApiOkResponse({ description: 'Request type updated successfully' })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Insufficient role permissions' })
  @ApiNotFoundResponse({ description: 'Request type not found' })
  @ApiConflictResponse({ description: 'Request type name already exists' })
  updateType(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRequestTypeDto,
  ) {
    return this.requestsService.updateRequestType(id, dto);
  }

  @Delete('types/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deactivate a request type',
    description: 'Soft-deletes a request type by setting isActive to false. Admin only.',
  })
  @ApiOkResponse({ description: 'Request type deactivated successfully' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Insufficient role permissions' })
  @ApiNotFoundResponse({ description: 'Request type not found' })
  deleteType(@Param('id', ParseUUIDPipe) id: string) {
    return this.requestsService.deleteRequestType(id);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get dashboard statistics',
    description: 'Returns request counts by status and recent activity. Students see only their own stats; staff and above see global stats.',
  })
  @ApiOkResponse({ description: 'Dashboard statistics with per-status counts and recent activity' })
  stats(@Req() req: AuthenticatedRequest) {
    const role = req.user.role as 'STUDENT' | 'STAFF' | 'COORDINATOR' | 'ADMIN';
    return this.requestsService.getStats(req.user.id, role);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get request detail',
    description: 'Returns full request details including attachments, history, and user information.',
  })
  @ApiOkResponse({ description: 'Request detail with attachments and history' })
  @ApiNotFoundResponse({ description: 'Request not found' })
  @ApiForbiddenResponse({ description: 'Student can only view their own requests' })
  findOne(@Req() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    const role = req.user.role as 'STUDENT' | 'STAFF' | 'COORDINATOR' | 'ADMIN';
    return this.requestsService.findOne(id, req.user.id, role);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Edit draft request',
    description: 'Updates title or description of a request. Only allowed in DRAFT status and by the owner.',
  })
  @ApiOkResponse({ description: 'Request updated successfully' })
  @ApiNotFoundResponse({ description: 'Request not found' })
  @ApiForbiddenResponse({ description: 'Not the owner or request is not in DRAFT status' })
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRequestDto,
  ) {
    return this.requestsService.update(id, req.user.id, dto);
  }

  @Post(':id/submit')
  @ApiOperation({
    summary: 'Submit draft request',
    description: 'Transitions a request from DRAFT to SUBMITTED. Cannot be undone.',
  })
  @ApiOkResponse({ description: 'Request submitted successfully' })
  @ApiNotFoundResponse({ description: 'Request not found' })
  @ApiConflictResponse({ description: 'Request is not in DRAFT status' })
  @ApiForbiddenResponse({ description: 'Not the owner of the request' })
  submit(@Req() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.requestsService.submit(id, req.user.id);
  }

  @Post(':id/cancel')
  @ApiOperation({
    summary: 'Cancel request',
    description: 'Cancels a request. Not allowed if the request is already in a final state (APPROVED, REJECTED, CANCELLED).',
  })
  @ApiOkResponse({ description: 'Request cancelled successfully' })
  @ApiNotFoundResponse({ description: 'Request not found' })
  @ApiForbiddenResponse({ description: 'Not the owner or request is in a final state' })
  cancel(@Req() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.requestsService.cancel(id, req.user.id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('STAFF', 'COORDINATOR', 'ADMIN')
  @ApiOperation({
    summary: 'Change request status',
    description: 'Staff can move to IN_REVIEW or PENDING_DOCUMENTS. Coordinators can APPROVE or REJECT. Admins have full control.',
  })
  @ApiOkResponse({ description: 'Status changed successfully' })
  @ApiNotFoundResponse({ description: 'Request not found' })
  @ApiBadRequestResponse({ description: 'Comment is required when rejecting a request' })
  @ApiForbiddenResponse({ description: 'Insufficient role permissions or invalid status transition' })
  @ApiConflictResponse({ description: 'Request is already in the target state or a final state' })
  changeStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeStatusDto,
  ) {
    const role = req.user.role as 'STAFF' | 'COORDINATOR' | 'ADMIN';
    return this.requestsService.changeStatus(id, dto, req.user.id, role);
  }
}
