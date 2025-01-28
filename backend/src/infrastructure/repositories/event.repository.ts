import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from '../../core/domain/event';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EventRepository {
  constructor(@InjectModel('Event') private readonly eventModel: Model<Event>) {}

  /**
   * Speichert ein Event in der Datenbank.
   * Falls keine ID vorhanden ist, wird eine UUID generiert.
   */
  async save(event: Partial<Event>): Promise<Event> {
    const eventWithId = {
      ...event,
      id: event.id ?? uuidv4(), // Falls keine ID vorhanden ist, generiere eine
    };

    const createdEvent = new this.eventModel(eventWithId);
    return await createdEvent.save();
  }

  /**
   * Holt alle gespeicherten Events aus der Datenbank.
   */
  async findAll(): Promise<Event[]> {
    return await this.eventModel.find().exec();
  }

  /**
   * Sucht ein Event anhand der ID.
   */
  async findById(id: string): Promise<Event | null> {
    return await this.eventModel.findOne({ id }).exec();
  }
}
