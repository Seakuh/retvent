// tickets.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TicketsService } from 'src/application/services/ticket.service';
import { Event } from 'src/core/domain/event';
import { Ticket } from 'src/core/domain/ticket';
import { CreateTicketDto } from 'src/presentation/dtos/create-ticket.dto';
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
}
