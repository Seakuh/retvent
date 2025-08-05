import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket } from 'src/core/domain/ticket';
import { ITicketRepository } from 'src/core/repositories/ticket..repository.interface';

@Injectable()
export class MongoTicketRepository implements ITicketRepository {
  constructor(@InjectModel('Ticket') private ticketModel: Model<Ticket>) {}
  createTicket(userId: string, ticket: Ticket): Promise<Ticket> {
    return this.ticketModel.create({ ...ticket, userId });
  }
  createTicketWithEvent(ticket: Ticket): Promise<Ticket> {
    return this.ticketModel.create(ticket);
  }
  update(id: string, ticket: Ticket): Promise<Ticket | null> {
    return this.ticketModel.findByIdAndUpdate(id, ticket, { new: true }).exec();
  }
  async delete(ticketId: string): Promise<boolean> {
    const result = await this.ticketModel.findOneAndDelete({ ticketId });
    return result !== null;
  }

  async find(query: any): Promise<Ticket[]> {
    return this.ticketModel.find(query).exec();
  }

  async findById(id: string): Promise<Ticket | null> {
    return this.ticketModel.findById(id).exec();
  }

  async findTicketId(ticketId: string): Promise<Ticket | null> {
    return this.ticketModel.findOne({ ticketId }).exec();
  }

  async create(ticket: Ticket): Promise<Ticket> {
    return this.ticketModel.create(ticket);
  }

  async findTicketsIds(ticketIds: string[]): Promise<Ticket[]> {
    return this.ticketModel.find({ ticketId: { $in: ticketIds } }).exec();
  }
}
