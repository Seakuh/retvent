// tickets.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import { Ticket } from '../../core/domain/ticket.schema';

@Injectable()
export class TicketsService {
  constructor(@InjectModel(Ticket.name) private ticketModel: Model<Ticket>) {}

  async addGuest(dto: CreateTicketDto): Promise<Ticket> {
    const ticket = new this.ticketModel({
      eventId: dto.eventId,
      email: dto.email,
      ticketId: nanoid(10), // 🔥 Ticket-ID generieren
    });
    return ticket.save();
  }

  async getTicketsForEvent(eventId: string): Promise<Ticket[]> {
    return this.ticketModel.find({ eventId }).exec();
  }
}
