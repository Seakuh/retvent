import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ManagedTicketService } from '../../application/services/managed-ticket.service';
import { ManagedTicketAdminGuard } from '../guards/managed-ticket-admin.guard';
import {
  IssueTicketsDto,
  RedeemTicketDto,
  CancelTicketDto,
  TransferTicketDto,
  GetEventTicketsQueryDto,
} from '../dtos/managed-ticket.dtos';

@Controller('managed-tickets')
export class ManagedTicketController {
  constructor(private readonly ticketService: ManagedTicketService) {}

  /**
   * Issue tickets for an event (Admin only)
   * POST /managed-tickets/issue
   */
  @Post('issue')
  @UseGuards(AuthGuard('jwt'), ManagedTicketAdminGuard)
  async issueTickets(@Body() dto: IssueTicketsDto) {
    // Convert string dates to Date objects
    const issueDto = {
      ...dto,
      validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
      validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
    };
    return this.ticketService.issueTickets(issueDto);
  }

  /**
   * Validate ticket without redeeming
   * GET /managed-tickets/validate/:code
   */
  @Get('validate/:code')
  async validateTicket(
    @Param('code') code: string,
    @Query('eventId') eventId?: string,
  ) {
    return this.ticketService.validateTicket(code, eventId);
  }

  /**
   * Redeem ticket at entrance
   * POST /managed-tickets/redeem
   */
  @Post('redeem')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async redeemTicket(@Body() dto: RedeemTicketDto, @Req() req: any) {
    const scannerId = req.user?.sub || req.user?.id;
    return this.ticketService.redeemTicket(dto.code, scannerId, dto.eventId);
  }

  /**
   * Get all tickets for an event (Admin only)
   * GET /managed-tickets/event/:eventId
   */
  @Get('event/:eventId')
  @UseGuards(AuthGuard('jwt'), ManagedTicketAdminGuard)
  async getEventTickets(
    @Param('eventId') eventId: string,
    @Query() query: GetEventTicketsQueryDto,
  ) {
    return this.ticketService.getEventTickets(eventId, query.status);
  }

  /**
   * Get check-in statistics for event (Admin only)
   * GET /managed-tickets/event/:eventId/stats
   */
  @Get('event/:eventId/stats')
  @UseGuards(AuthGuard('jwt'), ManagedTicketAdminGuard)
  async getEventStats(@Param('eventId') eventId: string) {
    return this.ticketService.getEventStats(eventId);
  }

  /**
   * Get check-in history for event (Admin only)
   * GET /managed-tickets/event/:eventId/check-ins
   */
  @Get('event/:eventId/check-ins')
  @UseGuards(AuthGuard('jwt'), ManagedTicketAdminGuard)
  async getCheckInHistory(
    @Param('eventId') eventId: string,
    @Query('limit') limit?: number,
  ) {
    return this.ticketService.getCheckInHistory(eventId, limit);
  }

  /**
   * Get specific ticket details
   * GET /managed-tickets/:ticketId
   */
  @Get(':ticketId')
  @UseGuards(AuthGuard('jwt'))
  async getTicket(@Param('ticketId') ticketId: string) {
    return this.ticketService.getTicketById(ticketId);
  }

  /**
   * Cancel ticket (Admin only)
   * PUT /managed-tickets/:ticketId/cancel
   */
  @Put(':ticketId/cancel')
  @UseGuards(AuthGuard('jwt'), ManagedTicketAdminGuard)
  async cancelTicket(
    @Param('ticketId') ticketId: string,
    @Body() dto: CancelTicketDto,
    @Query('eventId') eventId?: string,
  ) {
    return this.ticketService.cancelTicket(ticketId, dto.reason);
  }

  /**
   * Reissue ticket (Admin only)
   * POST /managed-tickets/:ticketId/reissue
   */
  @Post(':ticketId/reissue')
  @UseGuards(AuthGuard('jwt'), ManagedTicketAdminGuard)
  async reissueTicket(
    @Param('ticketId') ticketId: string,
    @Query('eventId') eventId?: string,
  ) {
    return this.ticketService.reissueTicket(ticketId);
  }

  /**
   * Transfer ticket to new owner (Admin only)
   * PUT /managed-tickets/:ticketId/transfer
   */
  @Put(':ticketId/transfer')
  @UseGuards(AuthGuard('jwt'), ManagedTicketAdminGuard)
  async transferTicket(
    @Param('ticketId') ticketId: string,
    @Body() dto: TransferTicketDto,
    @Query('eventId') eventId?: string,
  ) {
    return this.ticketService.transferTicket(
      ticketId,
      dto.newEmail,
      dto.newUserId,
    );
  }

  /**
   * Get tickets by order
   * GET /managed-tickets/order/:orderId
   */
  @Get('order/:orderId')
  @UseGuards(AuthGuard('jwt'))
  async getOrderTickets(@Param('orderId') orderId: string) {
    return this.ticketService.getTicketsByOrder(orderId);
  }

  /**
   * Get user's tickets
   * GET /managed-tickets/user/me
   */
  @Get('user/me')
  @UseGuards(AuthGuard('jwt'))
  async getMyTickets(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    return this.ticketService.getUserTickets(userId);
  }
}
