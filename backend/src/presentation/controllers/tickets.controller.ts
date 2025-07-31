// tickets.controller.ts
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TicketsService } from 'src/application/services/ticket.service';
import { CreateTicketDto } from 'src/presentation/dtos/create-ticket.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  async createTicket(@Body() dto: CreateTicketDto) {
    return this.ticketsService.addGuest(dto);
  }

  @Get(':eventId')
  async getTickets(@Param('eventId') eventId: string) {
    return this.ticketsService.getTicketsForEvent(eventId);
  }
}
