// tickets.controller.ts
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TicketsService } from 'src/application/services/ticket.service';
import { Ticket } from 'src/core/domain/ticket';
import { CreateTicketDto } from 'src/presentation/dtos/create-ticket.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  async createTicket(@Body() dto: CreateTicketDto) {
    return this.ticketsService.addGuest(dto);
  }

  @Get('validate/:ticketId')
  @UseGuards(AuthGuard('jwt'))
  async validateTicket(
    @Param('ticketId') ticketId: string,
    @Param('hash') hash: string,
  ) {
    return this.ticketsService.validateTicket(ticketId, hash);
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
}
