// tickets.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TicketsService } from 'src/application/services/ticket.service';
import { Event } from 'src/core/domain/event';
import { Ticket } from 'src/core/domain/ticket';
import { ActivateTicketDto } from 'src/presentation/dtos/activate-ticket.dto';
import { CreateTicketDto } from 'src/presentation/dtos/create-ticket.dto';
import { ScanTicketDto } from 'src/presentation/dtos/scan-ticket.dto';
import { InviteTicketDto } from '../dtos/invite-guest.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  async createTicket(@Body() dto: CreateTicketDto) {
    return this.ticketsService.addGuest(dto);
  }

  @Post('invite-guest')
  // @UseGuards(CommunityAdminGuard)
  async inviteGuest(@Body() dto: InviteTicketDto) {
    return this.ticketsService.inviteGuest(dto);
  }

  @Get('invited-guest/:eventId')
  async getInvitedGuest(@Param('eventId') eventId: string) {
    // Corrected curl: curl -X GET http://localhost:4000/tickets/invited-guest/68ffa70c5a542490965029eb
    return this.ticketsService.getInviteGuestsByEventId(eventId);
  }

  @Get('validate/:ticketId')
  @UseGuards(AuthGuard('jwt'))
  async validateTicket(
    @Param('ticketId') ticketId: string,
    @Param('hash') hash: string,
  ) {
    return this.ticketsService.validateTicket(ticketId, hash);
  }

  @Get('tickets/:ticketIds')
  async getTicketsById(@Param('ticketIds') ticketIds: string[]) {
    return this.ticketsService.getTicketByIds(ticketIds);
  }

  @Get('event/:eventId')
  async getTickets(@Param('eventId') eventId: string) {
    const ticket = await this.ticketsService.getTicketsForEvent(eventId);
    console.log(ticket);
    return ticket;
  }

  @Get('/ticket/:ticketId')
  async getTicket(@Param('ticketId') ticketId: string): Promise<Ticket> {
    const ticket = await this.ticketsService.getTicketById(ticketId);
    return ticket;
  }

  @Get('/event/:eventId/ticket/:ticketId')
  async getTicketsForEvent(
    @Param('eventId') eventId: string,
    @Param('ticketId') ticketId: string,
  ): Promise<{ ticket: Ticket; event: Event }> {
    const { ticket, event } = await this.ticketsService.getTicketAndEvent(
      ticketId,
      eventId,
    );
    return { ticket, event };
  }

  @Delete('/ticket/:ticketId')
  async deleteTicket(@Param('ticketId') ticketId: string) {
    return this.ticketsService.deleteTicket(ticketId);
  }

  // =====================================================
  // Ticket Activation & QR Code Scanning
  // =====================================================

  /**
   * Activates a ticket after a guest accepts their invitation.
   * Changes the ticket status from 'pending' to 'active'.
   *
   * Example request:
   * POST /tickets/activate
   * Body: {
   *   "ticketId": "abc-123-def",
   *   "email": "guest@example.com",
   *   "hash": "a1b2c3d4"
   * }
   *
   * @param dto - The activation data (ticketId, email, hash)
   * @returns The activated ticket with success message
   */
  @Post('activate')
  async activateTicket(@Body() dto: ActivateTicketDto) {
    const { ticketId, email, hash } = dto;
    return this.ticketsService.activateTicket(ticketId, email, hash);
  }

  /**
   * Scans and validates a ticket at the event entrance using QR code.
   * Changes the ticket status from 'active' to 'validated'.
   *
   * This endpoint is typically used by event staff with a QR code scanner app.
   * The QR code contains both the ticketId and hash for verification.
   * Only event organizers and designated validators can scan tickets.
   *
   * Example request:
   * POST /tickets/scan
   * Body: {
   *   "ticketId": "abc-123-def",
   *   "hash": "a1b2c3d4"
   * }
   *
   * Response includes:
   * - ticket: The validated ticket details
   * - event: Full event information (for display on scanner app)
   * - message: Success/status message
   * - guestName: The guest's email/name for verification
   *
   * @param dto - The scan data from QR code (ticketId, hash)
   * @param req - Request object containing authenticated user
   * @returns Validated ticket with event details and guest information
   */
  @Post('scan')
  @UseGuards(AuthGuard('jwt'))
  async scanTicket(@Body() dto: ScanTicketDto, @Req() req: any) {
    const { ticketId, hash } = dto;
    const scannerId = req.user?.id || req.user?.sub;
    return this.ticketsService.scanTicketAtEntrance(ticketId, hash, scannerId);
  }

  /**
   * Approves a pending registration.
   * Changes ticket status from 'pending' to 'active' and sends confirmation email.
   *
   * Example request:
   * POST /tickets/:ticketId/approve
   *
   * @param ticketId - The ticket ID to approve
   * @returns The approved ticket with success message
   */
  @Post(':ticketId/approve')
  @UseGuards(AuthGuard('jwt'))
  async approveRegistration(@Param('ticketId') ticketId: string) {
    return this.ticketsService.approveRegistration(ticketId);
  }

  /**
   * Rejects a pending registration.
   * Deletes the ticket and sends rejection email.
   *
   * Example request:
   * POST /tickets/:ticketId/reject
   *
   * @param ticketId - The ticket ID to reject
   * @returns Success message
   */
  @Post(':ticketId/reject')
  @UseGuards(AuthGuard('jwt'))
  async rejectRegistration(@Param('ticketId') ticketId: string) {
    return this.ticketsService.rejectRegistration(ticketId);
  }
}
