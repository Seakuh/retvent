// tickets.service.ts
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { Ticket } from 'src/core/domain/ticket';
import { MongoEventRepository } from 'src/infrastructure/repositories/mongodb/event.repository';
import { MongoTicketRepository } from 'src/infrastructure/repositories/mongodb/ticket.repository';
import { CreateTicketDto } from 'src/presentation/dtos/create-ticket.dto';
@Injectable()
export class TicketsService {
  constructor(
    private readonly ticketRepository: MongoTicketRepository,
    private readonly eventRepository: MongoEventRepository,
    private readonly mailerService: MailerService,
  ) {}

  async addGuest(dto: CreateTicketDto): Promise<Ticket> {
    const ticket = await this.ticketRepository.create({
      eventId: dto.eventId,
      email: dto.email,
      ticketId: nanoid(10), // 🔥 Ticket-ID generieren
      status: 'pending',
      createdAt: new Date(),
    });
    try {
      await this.mailerService.sendMail({
        to: dto.email,
        subject: 'Ticket erstellt',
        text: `Ihr Ticket wurde erstellt. Ihre Ticket-ID ist: ${ticket.ticketId}`,
      });
    } catch (error) {
      console.error('Fehler beim Senden der E-Mail:', error);
    }
    return ticket;
  }

  async getTicketsForEvent(eventId: string): Promise<Ticket[]> {
    return this.ticketRepository.find({ eventId });
  }

  async getTicketById(ticketId: string): Promise<Ticket> {
    return this.ticketRepository.findTicketId(ticketId);
  }

  async updateTicket(ticketId: string, ticket: Ticket): Promise<Ticket> {
    return this.ticketRepository.update(ticketId, ticket);
  }

  async deleteTicket(ticketId: string): Promise<boolean> {
    return this.ticketRepository.delete(ticketId);
  }
}
