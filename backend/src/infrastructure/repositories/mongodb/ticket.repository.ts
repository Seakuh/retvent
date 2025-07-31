import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket } from 'src/core/domain/ticket';

@Injectable()
export class MongoTicketRepository {
  constructor(@InjectModel('Ticket') private ticketModel: Model<Ticket>) {}

  async find(query: any): Promise<Ticket[]> {
    return this.ticketModel.find(query).exec();
  }

  async findById(id: string): Promise<Ticket | null> {
    return this.ticketModel.findById(id).exec();
  }

  async create(ticket: Ticket): Promise<Ticket> {
    return this.ticketModel.create(ticket);
  }
}
