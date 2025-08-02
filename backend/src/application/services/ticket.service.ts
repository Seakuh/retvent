// tickets.service.ts
import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { Ticket } from 'src/core/domain/ticket';
import { MongoTicketRepository } from 'src/infrastructure/repositories/mongodb/ticket.repository';
import { CreateTicketDto } from 'src/presentation/dtos/create-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private readonly ticketRepository: MongoTicketRepository) {}

  async addGuest(dto: CreateTicketDto): Promise<Ticket> {
    const ticket = await this.ticketRepository.create({
      eventId: dto.eventId,
      email: dto.email,
      ticketId: nanoid(10), // 🔥 Ticket-ID generieren
      status: 'pending',
      createdAt: new Date(),
    });
    return ticket;
  }

  async getTicketsForEvent(eventId: string): Promise<Ticket[]> {
    return this.ticketRepository.find({ eventId });
  }

  async getTicketById(ticketId: string): Promise<Ticket> {
    return this.ticketRepository.findById(ticketId);
  }

  async updateTicket(ticketId: string, ticket: Ticket): Promise<Ticket> {
    return this.ticketRepository.update(ticketId, ticket);
  }

  async deleteTicket(ticketId: string): Promise<boolean> {
    return this.ticketRepository.delete(ticketId);
  }
}
