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

  private async addCommentCountToEvents(events: any[]): Promise<Event[]> {
    const eventIds = events.map((event) => event._id);
    const commentCounts = await this.eventModel.aggregate([
      {
        $match: { _id: { $in: eventIds } },
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'eventId',
          as: 'comments',
        },
      },
      {
        $addFields: {
          commentCount: { $size: '$comments' },
        },
      },
    ]);

    const commentCountMap = new Map(
      commentCounts.map((event) => [event._id.toString(), event.commentCount]),
    );

    return events.map((event) => ({
      ...this.toEntity(event),
      commentCount: commentCountMap.get(event._id.toString()) || 0,
    }));
  }

  getEventsByTag(tag: string) {
    return this.eventModel
      .find({ tags: tag })
      .sort({ createdAt: -1 })
      .sort({ views: -1 })
      .limit(10)
      .exec();
  }

  async findAllWithEmbedding(limit: number) {
    const events = await this.eventModel
      .find({ embedding: { $exists: true } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
    return events.map((event) => ({
      ...this.toEntity(event),
    }));
  }

  updateEmbedding(id: string, embedding: number[]): Promise<Event | null> {
    return this.eventModel
      .findByIdAndUpdate(id, { embedding }, { new: true })
      .exec();
  }

  findMissingEmbeddings(batchSize: number): Promise<Event[]> {
    return this.eventModel
      .find({ embedding: { $exists: false } })
      .limit(batchSize)
      .sort({ createdAt: 1 })
      .exec();
  }

  findLatestEventsCity(city: string, limit: number) {
    return this.eventModel
      .find({ city: city })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findTodayEvents(): Promise<Event[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = await this.eventModel
      .find({ startDate: { $gte: today } })
      .exec();
    return this.addCommentCountToEvents(events);
  }

  async getPopularEventsByCategory(category: string, limit: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const events = await this.eventModel
      .find({ category, startDate: { $gte: today } })
      .sort({ views: -1 })
      .limit(limit)
      .exec();
    return this.addCommentCountToEvents(events);
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

  async searchByCity(city: string, limit: number) {
    const events = await this.eventModel
      .find({
        city: { $regex: new RegExp(city, 'i') },
      })
      .select('id title imageUrl startDate city views commentCount')
      .limit(limit)
      .exec();
    return this.addCommentCountToEvents(events);
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
    const event = await this.eventModel.findById(id).exec();

    if (!event) {
      return null;
    }

    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true, setDefaultsOnInsert: true },
      )
      .exec();

    if (!updatedEvent) {
      return null;
    }

    const [eventWithComments] = await this.eventModel.aggregate([
      { $match: { _id: updatedEvent._id } },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'eventId',
          as: 'comments',
        },
      },
      {
        $addFields: {
          commentCount: { $size: '$comments' },
        },
      },
    ]);

    return this.toEntity(eventWithComments);
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
      .select('id title imageUrl startDate city views commentCount')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
    return this.addCommentCountToEvents(events);
  }

  async findByCategory(
    category: string,
    skip: number = 0,
    limit: number = 10,
    location?: string,
  ): Promise<Event[]> {
    const query: any = {
      category: { $regex: new RegExp(category, 'i') },
    };

    if (location) {
      query.city = { $regex: new RegExp(location, 'i') };
    }

    const events = await this.eventModel
      .find(query)
      .select('id title imageUrl startDate city views')
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    console.log('events', events);

    return this.addCommentCountToEvents(events);
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
    console.log('params', params.city);
    // Alle Filter zusammen aufbauen
    if (params.query) {
      filter.$or = [
        { title: { $regex: params.query, $options: 'i' } },
        { description: { $regex: params.query, $options: 'i' } },
      ];
    }

    if (params.city) {
      filter.city = { $regex: new RegExp(params.city, 'i') };
    }

    if (params.dateRange) {
      filter.startDate = {
        $gte: new Date(params.dateRange.startDate),
        $lte: new Date(params.dateRange.endDate),
      };
    }

    const events = await this.eventModel
      .find(filter)
      .select('id title imageUrl startDate city views commentCount')
      .exec();

    return this.addCommentCountToEvents(events);
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
      .select('id title imageUrl startDate city views commentCount')
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    return this.addCommentCountToEvents(events);
  }

  async findAllWithCommentCount() {
    return this.eventModel.aggregate([
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'eventId',
          as: 'comments',
        },
      },
      {
        $addFields: {
          commentCount: { $size: '$comments' },
        },
      },
      {
        $project: {
          comments: 0, // Entferne das comments Array aus dem Ergebnis
        },
      },
    ]);
  }

  async findByIdWithCommentCount(id: string) {
    const [event] = await this.eventModel.aggregate([
      {
        $match: { _id: id },
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'eventId',
          as: 'comments',
        },
      },
      {
        $addFields: {
          commentCount: { $size: '$comments' },
        },
      },
      {
        $project: {
          comments: 0, // Entferne das comments Array aus dem Ergebnis
        },
      },
    ]);

    return event;
  }
}
