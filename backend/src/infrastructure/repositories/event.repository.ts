import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from '../../core/domain/event';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EventRepository {

  constructor(@InjectModel('Event') private readonly eventModel: Model<Event>) { }

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

  /**
 * Findet die neuesten 30 Events, sortiert nach Erstellungsdatum.
 */
  async findLatestEvents(): Promise<Event[]> {
    return await this.eventModel.find().sort({ createdAt: -1 }).limit(30).exec();
  }


  async findNearbyEvents(lat: number, lon: number, maxDistanceKm = 10) {
    return this.eventModel.find({
      geoLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lon, lat], // MongoDB braucht [lon, lat]
          },
          $maxDistance: maxDistanceKm * 15000, // Meter
        },
      },
    }).exec();
  }
  async updateEvent(eventId: string, updateData: any) {
    return this.eventModel.findByIdAndUpdate(eventId, updateData, { new: true }).exec();
  }


  async findEventsByIds(eventIds: string[]) {
    return this.eventModel.find({ _id: { $in: eventIds } }).exec();
  }

}
