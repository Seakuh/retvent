import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MapEventDto } from 'src/presentation/dtos/map-event.dto';
import { UpdateEventDto } from 'src/presentation/dtos/update-event.dto';
import { Event } from '../../../core/domain/event';
import { IEventRepository } from '../../../core/repositories/event.repository.interface';
@Injectable()
export class MongoEventRepository implements IEventRepository {
  constructor(@InjectModel('Event') private eventModel: Model<Event>) {}
  async findTodayEvents(): Promise<Event[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = await this.eventModel
      .find({ startDate: { $gte: today } })
      .exec();
    return events.map((event) => this.toEntity(event));
  }

  async getPopularEventsByCategory(category: string, limit: number) {
    // get event with most views in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const events = await this.eventModel
      .find({ category, startDate: { $gte: today } })
      .sort({ views: -1 })
      .limit(limit)
      .exec();
    return events.map((event) => this.toEntity(event));
  }

  async getPopularEventsNearby(lat: number, lon: number, limit: number) {
    // get event with most views
    const events = await this.eventModel
      .find({
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lon, lat],
            },
            $maxDistance: 100000,
          },
        },
      })
      .sort({ views: -1 })
      .limit(limit)
      .exec();
    return events.map((event) => this.toEntity(event));
  }

  async getCategories(
    limit: number = 20,
  ): Promise<{ category: string; count: number }[]> {
    const categories = await this.eventModel
      .aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: limit },
        {
          $project: {
            _id: 0,
            name: '$_id',
          },
        },
      ])
      .exec();

    return categories.map((category) => category.name);
  }

  findLatestEventsByHost(username: string) {
    return this.eventModel
      .find({
        id: username,
      })
      .sort({ createdAt: -1 })
      .limit(1)
      .exec();
  }
  searchByCity(city: string) {
    return this.eventModel
      .find({
        city: { $regex: new RegExp(city, 'i') },
      })
      .exec();
  }

  private toEntity(doc: any): Event {
    const event = doc.toObject ? doc.toObject() : doc;
    const { _id, __v, ...rest } = event;

    // Ensure city is included in response
    return {
      ...rest,
      id: _id.toString(),
      city: event.city || event.location?.city, // Fallback to location.city
    };
  }

  async findById(id: string): Promise<Event | null> {
    // Zuerst prüfen wir, ob das Event existiert und ob es ein views Feld hat
    const event = await this.eventModel.findById(id).exec();

    if (!event) {
      return null;
    }

    // Wenn das Event existiert, erhöhen wir die Views
    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(
        id,
        {
          $inc: { views: 1 }, // Erhöht views um 1
        },
        {
          new: true, // Gibt das aktualisierte Dokument zurück
          // Wenn views nicht existiert, wird es mit 0 initialisiert und dann um 1 erhöht
          setDefaultsOnInsert: true,
        },
      )
      .exec();

    console.log('Updated Event:', updatedEvent);
    return updatedEvent ? this.toEntity(updatedEvent) : null;
  }

  async findByLocationId(locationId: string): Promise<Event[]> {
    const events = await this.eventModel.find({ locationId }).exec();
    return events.map((event) => this.toEntity(event));
  }

  async findByOrganizerId(organizerId: string): Promise<Event[]> {
    const events = await this.eventModel.find({ organizerId }).exec();
    return events.map((event) => this.toEntity(event));
  }

  async create(eventData: Partial<Event>): Promise<Event> {
    try {
      console.log(
        'Creating event with data:',
        JSON.stringify(eventData, null, 2),
      );

      const eventDataWithLocation = {
        ...eventData,
        views: 0,
        location: {
          type: 'Point',
          coordinates: [
            eventData.uploadLat, // longitude
            eventData.uploadLon, // latitude
          ],
        },
      };

      // Create new event document
      const event = new this.eventModel(eventDataWithLocation);

      // Save and wait for result
      const savedEvent = await event.save();
      console.log(
        'Saved event:',
        JSON.stringify(savedEvent.toObject(), null, 2),
      );

      return this.toEntity(savedEvent);
    } catch (error) {
      console.error('Error saving event:', error);
      throw error;
    }
  }

  private toMapEntity(doc: any): MapEventDto {
    const event = doc.toObject ? doc.toObject() : doc;
    return {
      id: event._id.toString(),
      title: event.title,
      imageUrl: event.imageUrl,
      location: event.location,
      startDate: event.startDate,
    };
  }

  async findNearbyEventsForMap(
    lat: number,
    lon: number,
    distance: number,
    limit: number,
  ): Promise<MapEventDto[]> {
    // Rückgabetyp geändert
    const events = await this.eventModel
      .find(
        {
          'location.coordinates': {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [lon, lat],
              },
              $maxDistance: distance * 1000,
            },
          },
        },
        {
          _id: 1,
          title: 1,
          imageUrl: 1,
          location: 1,
          startDate: 1,
        },
      )
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    return events.map((event) => this.toMapEntity(event)); // Verwende toMapEntity statt toEntity
  }

  async createEventFromFormData(eventData: Partial<Event>): Promise<Event> {
    try {
      console.log(
        'Creating event with data:',
        JSON.stringify(eventData, null, 2),
      );

      // Create new event document
      const event = new this.eventModel(eventData);

      // Save and wait for result
      const savedEvent = await event.save();
      console.log(
        'Saved event:',
        JSON.stringify(savedEvent.toObject(), null, 2),
      );

      return this.toEntity(savedEvent);
    } catch (error) {
      console.error('Error saving event:', error);
      throw error;
    }
  }

  async update(id: string, eventData: UpdateEventDto): Promise<Event | null> {
    const updated = await this.eventModel
      .findByIdAndUpdate(id, eventData, { new: true })
      .exec();
    return updated ? this.toEntity(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.eventModel.deleteOne({ _id: id }).exec();
    return result.deletedCount === 1;
  }

  async findUpcoming(locationId: string): Promise<Event[]> {
    const events = await this.eventModel
      .find({
        locationId,
        startDate: { $gte: new Date() },
      })
      .sort({ startDate: 1 })
      .exec();
    return events.map((event) => this.toEntity(event));
  }

  async updateEvent(
    id: string,
    eventData: UpdateEventDto,
  ): Promise<Event | null> {
    return this.update(id, eventData);
  }

  async addLike(eventId: string, userId: string): Promise<Event | null> {
    const updated = await this.eventModel
      .findByIdAndUpdate(
        eventId,
        { $addToSet: { likeIds: userId } },
        { new: true },
      )
      .exec();
    return updated ? this.toEntity(updated) : null;
  }

  async removeLike(eventId: string, userId: string): Promise<Event | null> {
    const updated = await this.eventModel
      .findByIdAndUpdate(eventId, { $pull: { likeIds: userId } }, { new: true })
      .exec();
    return updated ? this.toEntity(updated) : null;
  }

  async addArtist(eventId: string, artistId: string): Promise<Event | null> {
    const updated = await this.eventModel
      .findByIdAndUpdate(
        eventId,
        { $addToSet: { artistIds: artistId } },
        { new: true },
      )
      .exec();
    return updated ? this.toEntity(updated) : null;
  }

  async removeArtist(eventId: string, artistId: string): Promise<Event | null> {
    const updated = await this.eventModel
      .findByIdAndUpdate(
        eventId,
        { $pull: { artistIds: artistId } },
        { new: true },
      )
      .exec();
    return updated ? this.toEntity(updated) : null;
  }

  async findByLocationIds(locationIds: string[]): Promise<Event[]> {
    const events = await this.eventModel
      .find({ locationId: { $in: locationIds } })
      .exec();
    return events.map((event) => this.toEntity(event));
  }

  async findAll(): Promise<Event[]> {
    const events = await this.eventModel.find().exec();
    return events.map((event) => this.toEntity(event));
  }

  async findLatest(limit: number): Promise<Event[]> {
    const events = await this.eventModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
    return events.map((event) => this.toEntity(event));
  }

  async findByCategory(
    category: string,
    skip: number = 0,
    limit: number = 10,
  ): Promise<Event[]> {
    const events = await this.eventModel
      .find({ category: { $regex: new RegExp(`^${category}$`, 'i') } })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    console.log(`Found ${events.length} events`); // Debug log
    return events.map((event) => this.toEntity(event));
  }

  async countByCategory(category: string): Promise<number> {
    return this.eventModel.countDocuments({ category }).exec();
  }

  async getUserFavorites(eventIds: string[]): Promise<Event[]> {
    const events = await this.eventModel
      .find({ _id: { $in: eventIds } })
      .exec();
    return events.map((event) => this.toEntity(event));
  }

  async findByHostId(
    hostId: string,
    skip: number = 0,
    limit: number = 10,
  ): Promise<Event[]> {
    console.log(`Finding events for hostId: ${hostId}`); // Debug log
    const events = await this.eventModel
      .find({ hostId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    console.log(`Found ${events.length} events`); // Debug log
    return events.map((event) => this.toEntity(event));
  }

  async countByHostId(hostId: string): Promise<number> {
    return this.eventModel.countDocuments({ hostId }).exec();
  }

  async findByHostUsername(username: string): Promise<Event[]> {
    console.log(`Finding events for host: ${username}`); // Debug log
    const events = await this.eventModel
      .find({ hostUsername: username })
      .sort({ createdAt: -1 })
      .exec();
    console.log(`Found ${events.length} events`); // Debug log
    return events.map((event) => this.toEntity(event));
  }

  async searchEvents(params: {
    query?: string;
    city?: string;
    dateRange?: { startDate: string; endDate: string };
  }): Promise<Event[]> {
    const filter: any = {};

    if (params.query) {
      filter.$or = [
        { title: { $regex: params.query, $options: 'i' } },
        { description: { $regex: params.query, $options: 'i' } },
      ];
    }

    if (params.city) {
      filter['location.city'] = { $regex: new RegExp(params.city, 'i') };
    }

    if (params.dateRange) {
      filter.startDate = {
        $gte: new Date(params.dateRange.startDate),
        $lte: new Date(params.dateRange.endDate),
      };
    }

    const events = await this.eventModel.find(filter).exec();
    return events.map((event) => this.toEntity(event));
  }

  async findByCity(
    city: string,
    skip: number = 0,
    limit: number = 10,
  ): Promise<Event[]> {
    const events = await this.eventModel
      .find({ 'location.city': { $regex: new RegExp(city, 'i') } })
      .skip(skip)
      .limit(limit)
      .exec();
    return events.map((event) => this.toEntity(event));
  }

  async countByCity(city: string): Promise<number> {
    return this.eventModel.countDocuments({
      'location.city': { $regex: new RegExp(city, 'i') },
    });
  }

  async getPopularCities(
    limit: number = 10,
  ): Promise<{ city: string; count: number }[]> {
    const cities = await this.eventModel
      .aggregate([
        {
          $group: {
            _id: '$location.city',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: limit },
        {
          $project: {
            _id: 0,
            city: '$_id',
            count: 1,
          },
        },
      ])
      .exec();
    return cities;
  }

  async findNearbyEvents(
    lat: number,
    lon: number,
    distance: number,
    limit: number,
  ): Promise<Event[]> {
    const events = await this.eventModel
      .find({
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lon, lat],
            },
            $maxDistance: distance * 1000, // Convert km to meters
          },
        },
      })
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    return events.map((event) => this.toEntity(event));
  }
}
