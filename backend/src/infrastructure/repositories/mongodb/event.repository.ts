import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from '../../../core/domain/event';
import { IEventRepository } from '../../../core/repositories/event.repository.interface';

@Injectable()
export class MongoEventRepository implements IEventRepository {
  constructor(
    @InjectModel('Event') private eventModel: Model<Event>
  ) {}

  async findById(id: string): Promise<Event | null> {
    const event = await this.eventModel.findById(id).exec();
    return event ? new Event(event.toObject()) : null;
  }

  async findByLocationId(locationId: string): Promise<Event[]> {
    const events = await this.eventModel.find({ locationId }).exec();
    return events.map(event => new Event(event.toObject()));
  }

  async findByOrganizerId(organizerId: string): Promise<Event[]> {
    const events = await this.eventModel.find({ organizerId }).exec();
    return events.map(event => new Event(event.toObject()));
  }

  async create(eventData: Partial<Event>): Promise<Event> {
    const created = await this.eventModel.create(eventData);
    return new Event(created.toObject());
  }

  async update(id: string, eventData: Partial<Event>): Promise<Event | null> {
    const updated = await this.eventModel
      .findByIdAndUpdate(id, eventData, { new: true })
      .exec();
    return updated ? new Event(updated.toObject()) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.eventModel.deleteOne({ _id: id }).exec();
    return result.deletedCount === 1;
  }

  async findUpcoming(locationId: string): Promise<Event[]> {
    const events = await this.eventModel
      .find({
        locationId,
        startDate: { $gte: new Date() }
      })
      .sort({ startDate: 1 })
      .exec();
    return events.map(event => new Event(event.toObject()));
  }

  async updateEvent(id: string, eventData: Partial<Event>): Promise<Event | null> {
    return this.update(id, eventData);
  }

  async addLike(eventId: string, userId: string): Promise<Event | null> {
    const updated = await this.eventModel
      .findByIdAndUpdate(
        eventId,
        { $addToSet: { likeIds: userId } },
        { new: true }
      )
      .exec();
    return updated ? new Event(updated.toObject()) : null;
  }

  async removeLike(eventId: string, userId: string): Promise<Event | null> {
    const updated = await this.eventModel
      .findByIdAndUpdate(
        eventId,
        { $pull: { likeIds: userId } },
        { new: true }
      )
      .exec();
    return updated ? new Event(updated.toObject()) : null;
  }

  async addArtist(eventId: string, artistId: string): Promise<Event | null> {
    const updated = await this.eventModel
      .findByIdAndUpdate(
        eventId,
        { $addToSet: { artistIds: artistId } },
        { new: true }
      )
      .exec();
    return updated ? new Event(updated.toObject()) : null;
  }

  async removeArtist(eventId: string, artistId: string): Promise<Event | null> {
    const updated = await this.eventModel
      .findByIdAndUpdate(
        eventId,
        { $pull: { artistIds: artistId } },
        { new: true }
      )
      .exec();
    return updated ? new Event(updated.toObject()) : null;
  }

  async findByLocationIds(locationIds: string[]): Promise<Event[]> {
    const events = await this.eventModel
      .find({ locationId: { $in: locationIds } })
      .exec();
    return events.map(event => new Event(event.toObject()));
  }

  async findAll(): Promise<Event[]> {
    const events = await this.eventModel.find().exec();
    return events.map(event => new Event(event.toObject()));
  }

  async findLatest(limit: number): Promise<Event[]> {
    const events = await this.eventModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
    return events.map(event => new Event(event.toObject()));
  }

  async findByCategory(category: string, skip: number = 0, limit: number = 10): Promise<Event[]> {
    const events = await this.eventModel
      .find({ category })
      .skip(skip)
      .limit(limit)
      .exec();
    return events.map(event => new Event(event.toObject()));
  }

  async countByCategory(category: string): Promise<number> {
    return this.eventModel.countDocuments({ category }).exec();
  }

  async findNearbyEvents(lat: number, lon: number, maxDistance: number): Promise<Event[]> {
    const events = await this.eventModel.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lon, lat]
          },
          $maxDistance: maxDistance * 1000 // Convert km to meters
        }
      }
    }).exec();
    return events.map(event => new Event(event.toObject()));
  }

  async getUserFavorites(eventIds: string[]): Promise<Event[]> {
    const events = await this.eventModel
      .find({ _id: { $in: eventIds } })
      .exec();
    return events.map(event => new Event(event.toObject()));
  }
} 