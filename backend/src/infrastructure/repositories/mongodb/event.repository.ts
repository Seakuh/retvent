import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateFullEventDto } from 'src/presentation/dtos/create-full-event.dto';
import { MapEventDto } from 'src/presentation/dtos/map-event.dto';
import { UpdateEventDto } from 'src/presentation/dtos/update-event.dto';
import { Event } from '../../../core/domain/event';
import { IEventRepository } from '../../../core/repositories/event.repository.interface';
@Injectable()
export class MongoEventRepository implements IEventRepository {


  constructor(@InjectModel('Event') private eventModel: Model<Event>) {}

  /**
   * Erstellt einen Filter für veröffentlichte Events
   * Schließt Draft-Events und Events mit zukünftigem scheduledReleaseDate aus
   * 
   * OPTIMIERT: Vereinfachte Filter-Logik für bessere Performance
   * - Nutzt bestehende Indizes (status, startDate)
   * - Minimiert verschachtelte $or/$and Operationen
   * 
   * @param additionalFilter - Zusätzliche Filter-Bedingungen
   * @returns MongoDB Filter-Objekt
   */
  private getPublishedEventsFilter(additionalFilter: any = {}): any {
    const now = new Date();
    
    // Extrahiere $and aus additionalFilter falls vorhanden
    const existingAnd = additionalFilter.$and || [];
    delete additionalFilter.$and;
    
    // Optimierte Filter-Logik:
    // 1. Status muss 'published' sein ODER nicht existieren (Abwärtskompatibilität)
    // 2. Status darf NICHT 'draft' sein
    // 3. scheduledReleaseDate muss nicht existieren ODER <= jetzt sein
    return {
      ...additionalFilter,
      $and: [
        ...existingAnd,
        {
          // Kombinierte Status-Bedingung: published ODER nicht vorhanden, aber NICHT draft
          $or: [
            { status: 'published' },
            { status: { $exists: false } },
          ],
        },
        {
          status: { $ne: 'draft' },
        },
        {
          // scheduledReleaseDate Filter: nur Events ohne Release-Datum oder mit erreichtem Datum
          $or: [
            { scheduledReleaseDate: { $exists: false } },
            { scheduledReleaseDate: { $lte: now } },
            { scheduledReleaseDate: null },
          ],
        },
      ],
    };
  }

  async searchEventsWithUserInput(
    location: string,
    category: string,
    prompt: string,
    startDate: string,
    endDate: string,
  ): Promise<Event[]> {
    const query: any = {};

    if (location !== undefined) {
      query.city = { $regex: new RegExp(location, 'i') };
    }

    if (category !== undefined) {
      query.category = { $regex: new RegExp(category, 'i') };
    }

    if (prompt !== undefined) {
      query.title = { $regex: new RegExp(prompt, 'i') };
    }

    if (startDate !== undefined && endDate !== undefined) {
      query.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Nur veröffentlichte Events anzeigen
    const filter = this.getPublishedEventsFilter(query);

    const events = await this.eventModel
      .find(filter)
      .sort({ createdAt: -1 })
      .select(
        'id description title imageUrl isSponsored startDate city views tags commentCount lineup.name hostId host.profileImageUrl host.username',
      )
      .limit(40)
      .exec();
    return this.addCommentCountToEvents(events);
  }
  private async addCommentCountToEvents(events: any[]): Promise<Event[]> {
    const eventIds = events
      .map((event) => event?._id)
      .filter((id) => id && Types.ObjectId.isValid(id));
    
    if (!eventIds.length) {
      return events.map((event) => ({
        ...this.toEntity(event),
        commentCount: 0,
      }));
    }

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
  findNewEvents(offset: number, limit: number, searchQuery: string) {
    const query: any = {};

    if (searchQuery) {
      query.$or = [
        { tags: { $regex: searchQuery, $options: 'i' } },
        { title: { $regex: searchQuery, $options: 'i' } },
      ];
    }

    // Nur veröffentlichte Events anzeigen
    const filter = this.getPublishedEventsFilter(query);

    return this.eventModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .select(
        'id title imageUrl startDate city views tags commentCount lineup.name hostId host.profileImageUrl host.username',
      )
      .limit(limit)
      .exec();
  }

  async getReelEvents(eventId?: string, offset?: number, limit?: number) {
    const now = new Date();
    const baseFilter = { startDate: { $gt: now } };
    const publishedFilter = this.getPublishedEventsFilter(baseFilter);

    if (eventId) {
      const event = await this.eventModel.findById(eventId).exec();
      if (!event) {
        return this.eventModel
          .find(publishedFilter)
          .sort({ startDate: 1 })
          .select(
            'id title imageUrl startDate city views tags commentCount lineup.name hostId host.profileImageUrl host.username commentCount tags',
          )
          .limit(limit)
          .skip(offset)
          .exec();
      }
      // Prüfe ob das Event selbst veröffentlicht ist
      const eventFilter = {
        _id: { $ne: eventId },
        ...publishedFilter,
      };
      const otherEvents = await this.eventModel
        .find(eventFilter)
        .sort({ startDate: 1 })
        .select(
          'id title imageUrl startDate city views tags commentCount lineup.name hostId host.profileImageUrl host.username commentCount tags',
        )
        .limit(limit)
        .skip(offset)
        .exec();
      // Nur Event hinzufügen, wenn es veröffentlicht ist
      const isPublished = (!event.status || event.status === 'published') &&
        (!event.scheduledReleaseDate || event.scheduledReleaseDate <= now);
      return isPublished ? [event, ...otherEvents] : otherEvents;
    }

    return this.eventModel
      .find(publishedFilter)
      .sort({ startDate: 1 })
      .limit(limit)
      .skip(offset)
      .exec();
  }

  findAdvertisementEvents(limit: number) {
    return this.eventModel
      .find({
        $or: [{ isAdvertisement: true }, { isSponsored: true }],
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  findSponsoredEvents(limit: number) {
    return this.eventModel
      .find({
        isSponsored: true,
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  findLatestStars(limit: number) {
    return this.eventModel
      .aggregate([
        {
          $addFields: {
            totalEngagement: {
              $add: [
                { $size: { $ifNull: ['$likes', []] } },
                { $size: { $ifNull: ['$comments', []] } },
              ],
            },
          },
        },
        {
          $sort: {
            totalEngagement: -1,
          },
        },
        {
          $limit: limit,
        },
      ])
      .exec();
  }

  getRankedPopularEvents() {
    return this.eventModel.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
  }
  uploadEventLinupPicture(eventId: string, imageUrl: string) {
    return this.eventModel.findByIdAndUpdate(eventId, {
      $push: {
        lineupPictureUrl: imageUrl,
      },
    });
  }

  getEventsByArtistName(name: string) {
    return this.eventModel
      .find({ lineup: { $elemMatch: { name: name } } })
      .exec();
  }

  updateLineupProfile(eventId: string, profileId: string, userId: string) {
    return this.eventModel.findByIdAndUpdate(eventId, {
      $set: {
        'lineup.$.profileId': profileId,
        'lineup.$.userId': userId,
      },
    });
  }

  uploadEventPictures(eventId: string, image: Express.Multer.File[]) {
    return this.eventModel.findByIdAndUpdate(eventId, {
      $push: {
        eventPictures: image,
      },
    });
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
    const embeddingFilter = { embedding: { $exists: true } };
    const filter = this.getPublishedEventsFilter(embeddingFilter);
    const events = await this.eventModel
      .find(filter)
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
    const cityFilter = { city: city };
    const filter = this.getPublishedEventsFilter(cityFilter);
    return this.eventModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findTodayEvents(): Promise<Event[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateFilter = { startDate: { $gte: today } };
    const filter = this.getPublishedEventsFilter(dateFilter);
    const events = await this.eventModel
      .find(filter)
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
      .select(
        'id description title imageUrl startDate city views tags commentCount',
      )
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

  async findByIds(ids: string[]): Promise<Event[]> {
    if (!ids.length) {
      return [];
    }

    const validIds = Array.from(
      new Set(ids.filter((id) => Types.ObjectId.isValid(id))),
    );

    if (!validIds.length) {
      return [];
    }

    const documents = await this.eventModel
      .find({ _id: { $in: validIds } })
      .select(
        'id title imageUrl description startDate city views tags commentCount lineup.name hostId host.profileImageUrl host.username commentCount tags',
      )
      .exec();

    const entities = documents.map((doc) => this.toEntity(doc));
    const entityMap = new Map(entities.map((event) => [event.id, event]));

    return ids
      .map((id) => entityMap.get(id))
      .filter((event): event is Event => Boolean(event));
  }

  findForAssessment(id: string): Promise<Event | null> {
    return this.eventModel.findById(id).select('title imageUrl startDate city views tags commentCount lineup.name').exec();
  }

  async findById(id: string): Promise<Event | null> {
    // "-embedding" bedeutet, dass das Feld "embedding" im zurückgegebenen Dokument ausgeschlossen wird
    // (es wird NICHT mitgeliefert)
    const event = await this.eventModel.findById(id).select('-embedding').exec();

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

    return this.toEntity(updatedEvent);
  }

  /**
   * Findet ein Event anhand von Slug und ID
   */
  async findBySlugAndId(slug: string, id: string): Promise<Event | null> {
    try {
      const event = await this.eventModel
        .findOne({
          slug,
          $or: [{ _id: id }, { id: id }],
        })
        .select('-embedding')
        .exec();
      
      if (!event) {
        return null;
      }

      // Views erhöhen und Event mit Kommentar-Count laden
      const updatedEvent = await this.eventModel
        .findOneAndUpdate(
          { slug, $or: [{ _id: id }, { id: id }] },
          { $inc: { views: 1 } },
          { new: true, setDefaultsOnInsert: true },
        )
        .exec();

      if (!updatedEvent) {
        return null;
      }

      // Event mit Kommentar-Count laden
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

      return eventWithComments ? this.toEntity(eventWithComments) : null;
    } catch (error) {
      return null;
    }
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
      const eventDataWithLocation = {
        ...eventData,
        views: 301,
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

  createSponsoredEvent(eventId: string, sponsored: boolean, sub: any) {
    return this.eventModel.findByIdAndUpdate(eventId, {
      $set: {
        isSponsored: sponsored,
      },
    });
  }

  async createEventFromFormData(eventData: Partial<Event>): Promise<Event> {
    try {
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

  updateFromPrompt(eventId: string, eventFromPrompt: UpdateEventDto) {
    return this.eventModel.findByIdAndUpdate(eventId, eventFromPrompt, {
      new: true,
    });
  }

  updateFromPromptV2(eventId: string, eventFromPrompt: UpdateEventDto, detailedEventDescription: string) {
    return this.eventModel.findByIdAndUpdate(eventId, {
      ...eventFromPrompt,
      description: detailedEventDescription,
    }, {
      new: true,
    });
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

  async updateEventImage(
    eventId: string,
    imageUrl: string,
  ): Promise<Event | null> {
    return this.eventModel
      .findByIdAndUpdate(eventId, { imageUrl }, { new: true })
      .exec();
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
    const filter = this.getPublishedEventsFilter();
    const events = await this.eventModel
      .find(filter)
      .select(
        'id description title imageUrl lineup startDate city views tags commentCount',
      )
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

    const filter = this.getPublishedEventsFilter(query);
    const events = await this.eventModel
      .find(filter)
      .select('id description title imageUrl startDate city views')
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    console.log('events', events);

    return this.addCommentCountToEvents(events);
  }

  async countByCategory(category: string): Promise<number> {
    return this.eventModel.countDocuments({ category }).exec();
  }

  async getUserFavorites(
    eventIds: string[],
    dateRange?: { startDate?: string; endDate?: string },
    location?: string,
    category?: string,
  ): Promise<Event[]> {
    // Filtere ungültige und undefined IDs
    const validIds = eventIds
      .filter((id) => id && typeof id === 'string' && Types.ObjectId.isValid(id));

    if (!validIds.length) {
      return [];
    }

    const query: any = {
      _id: { $in: validIds },
    };

    if (dateRange?.startDate && dateRange?.endDate) {
      query.startDate = {
        $gte: new Date(dateRange.startDate),
        $lte: new Date(dateRange.endDate),
      };
    }

    if (category) {
      query.category = { $regex: new RegExp(category, 'i') };
    }

    if (location) {
      query.city = { $regex: new RegExp(location, 'i') };
    }

    console.log('query', query);

    const events = await this.eventModel
      .find(query)
      .select(
        'id description title imageUrl lineup startDate endDate city views commentCount tags hostId host.profileImageUrl host.username lineupPictureUrl',
      )
      .exec();

    return this.addCommentCountToEvents(events);
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

  async findAndCountByHostId(
    hostId: string,
    skip: number,
    limit: number,
  ): Promise<{ events: Event[]; total: number }> {
    const [events, total] = await Promise.all([
      this.eventModel.find({ hostId }).skip(skip).limit(limit).exec(),
      this.eventModel.countDocuments({ hostId }),
    ]);

    return { events: events.map((e) => this.toEntity(e)), total };
  }

  async findAndCountBySlug(
    slug: string,
    skip: number,
    limit: number,
  ): Promise<{ events: Event[]; total: number }> {
    const isObjectId = /^[a-f\d]{24}$/i.test(slug);

    // Baue die OR-Bedingungen dynamisch
    const orConditions = isObjectId
      ? [{ hostId: slug }, { 'lineup.name': slug }]
      : [{ 'host.username': slug }, { 'lineup.name': slug }];

    const filter = { $or: orConditions };
    console.log('filter', filter);

    const [events, total] = await Promise.all([
      this.eventModel.find(filter).skip(skip).limit(limit).exec(),
      this.eventModel.countDocuments(filter),
    ]);

    return {
      events: events.map((e) => this.toEntity(e)),
      total,
    };
  }

  async findAndCountByHostUsername(
    slug: string,
    userId?: string,
  ): Promise<{ events: Event[]; total: number }> {
    const orConditions = [
      { 'host.username': slug },
      { 'lineup.name': slug },
      ...(userId ? [{ hostId: userId }] : []),
    ];
    const filter = { $or: orConditions };
    const [events, total] = await Promise.all([
      this.eventModel
        .find(filter)
        .select('id title imageUrl startDate city views commentCount')
        .exec(),
      this.eventModel.countDocuments(filter),
    ]);

    return { events: events.map((event) => this.toEntity(event)), total };
  }

  async findAndCountByHostUsernameV2(
    slug: string,
    userId?: string,
  ): Promise<{ events: Event[]; total: number }> {
    const orConditions = [
      { 'host.username': slug },
      { 'lineup.name': slug },
      ...(userId ? [{ hostId: userId }] : []),
    ];
    const filter = { $or: orConditions };
    const [events, total] = await Promise.all([
      this.eventModel
        .find(filter)
        .select(
          'id title imageUrl startDate startTime endDate  city views commentCount capacity registrations category difficulty parentEventId',
        )
        .exec(),
      this.eventModel.countDocuments(filter),
    ]);

    return { events: events.map((event) => this.toEntity(event)), total };
  }

  async countByHostId(hostId: string): Promise<number> {
    return this.eventModel.countDocuments({ hostId }).exec();
  }

  async findByHostUsername(username: string): Promise<Event[]> {
    const events = await this.eventModel
      .find({ hostUsername: username })
      .sort({ createdAt: -1 })
      .exec();
    return events.map((event) => this.toEntity(event));
  }

  async findByHostUsernameFullMeta(username: string): Promise<Event[]> {
    const events = await this.eventModel
      .find({ hostUsername: username })
      .sort({ createdAt: -1 })
      .exec();
    return events.map((event) => this.toEntity(event));
  }

  async searchEvents(params: {
    query?: string;
    city?: string;
    citySlug?: string;
    category?: string;
    categorySlug?: string;
    eventType?: string;
    genre?: string;
    dateRange?: { startDate: string; endDate: string };
    status?: string;
  }): Promise<Event[]> {
    const filter: any = {};
    
    // Status-Filter (Standard: published, aber auch abwärtskompatibel)
    // Wenn explizit ein Status angegeben ist, verwende diesen (z.B. für Admin-Ansichten)
    if (params.status && params.status !== 'published') {
      filter.$or = [
        { status: params.status },
        { status: { $exists: false } }, // Für abwärtskompatibilität
      ];
    } else {
      // Standard: verwende den Published-Filter (schließt Drafts und zukünftige Releases aus)
      // Der Filter wird später durch getPublishedEventsFilter angewendet
    }

    // Query-Filter (Titel/Beschreibung)
    if (params.query) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { title: { $regex: params.query, $options: 'i' } },
          { description: { $regex: params.query, $options: 'i' } },
        ],
      });
    }

    // Stadt-Filter (citySlug hat Priorität)
    if (params.citySlug) {
      filter.citySlug = params.citySlug;
    } else if (params.city) {
      filter.city = { $regex: new RegExp(params.city, 'i') };
    }

    // Kategorie-Filter (categorySlug hat Priorität)
    if (params.categorySlug) {
      filter.categorySlug = params.categorySlug;
    } else if (params.category) {
      filter.category = { $regex: new RegExp(params.category, 'i') };
    }

    // Event-Typ-Filter
    if (params.eventType) {
      filter.eventType = params.eventType;
    }

    // Genre-Filter
    if (params.genre) {
      filter.genre = { $in: [params.genre] };
    }

    // Datum-Filter
    if (params.dateRange) {
      filter.startDate = {
        $gte: new Date(params.dateRange.startDate),
        $lte: new Date(params.dateRange.endDate),
      };
    }

    // Wende Published-Filter an, außer wenn explizit ein anderer Status angefordert wurde
    const finalFilter = params.status && params.status !== 'published' 
      ? filter 
      : this.getPublishedEventsFilter(filter);

    const events = await this.eventModel
      .find(finalFilter)
      .select(
        'id description title imageUrl startDate city views commentCount lineupPictureUrl',
      )
      .exec();

    return this.addCommentCountToEvents(events);
  }

  async findByCity(
    city: string,
    skip: number = 0,
    limit: number = 10,
  ): Promise<Event[]> {
    const cityFilter = { 'location.city': { $regex: new RegExp(city, 'i') } };
    const filter = this.getPublishedEventsFilter(cityFilter);
    const events = await this.eventModel
      .find(filter)
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
    const geoFilter = {
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lon, lat],
          },
          $maxDistance: distance * 1000, // Convert km to meters
        },
      },
    };
    const filter = this.getPublishedEventsFilter(geoFilter);
    const events = await this.eventModel
      .find(filter)
      .select('id description title imageUrl startDate city views commentCount')
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

  findBySlug(slug: string, skip: any, limit: any): Event | PromiseLike<Event> {
    return this.eventModel.findOne({ slug }).exec();
  }

  uploadLineupPictures(eventId: string, imageUrls: string[], id: any) {
    return this.eventModel
      .findByIdAndUpdate(
        eventId,
        { $push: { lineupPictureUrl: { $each: imageUrls } } },
        { new: true },
      )
      .exec();
  }

  uploadEventVideo(eventId: string, videoUrl: string) {
    return this.eventModel
      .findByIdAndUpdate(
        eventId,
        { $push: { videoUrls: videoUrl } },
        { new: true },
      )
      .exec();
  }

  uploadEventDocuments(eventId: string, documentUrls: string[]) {
    return this.eventModel
      .findByIdAndUpdate(
        eventId,
        { $push: { documents: { $each: documentUrls } } },
        { new: true },
      )
      .exec();
  }

  updateLineupFromImage(
    eventId: string,
    lineUp: Partial<Array<{ name: string; role?: string; startTime?: string }>>,
  ) {
    return this.eventModel
      .findByIdAndUpdate(eventId, { $set: { lineup: lineUp } }, { new: true })
      .exec();
  }

  botViewEvent(id: string) {
    return this.eventModel.findByIdAndUpdate(
      id,
      { $inc: { views: 14 } },
      { new: true },
    );
  }

  // ------------------------------------------------------------
  // Register Event
  // ------------------------------------------------------------

  findRegisteredEvents(userId: string) {
    return this.eventModel.find({ registeredUserIds: userId }).exec();
  }
  unregisterEvent(eventId: string, userId: string) {
    return this.eventModel.findByIdAndUpdate(eventId, {
      $pull: { registeredUserIds: userId },
      $inc: { registrations: -1 },
    });
  }
  registerEvent(eventId: string, userId: string) {
    return this.eventModel.findByIdAndUpdate(
      eventId,
      {
        $addToSet: { registeredUserIds: userId },
        $inc: { registrations: 1 },
      },
      { new: true },
    );
  }

  // ------------------------------------------------------------
  // Invite 2 Event
  // ------------------------------------------------------------

  inviteToEvent(eventId: string, userId: string, id: any) {
    return this.eventModel.findByIdAndUpdate(eventId, {
      $push: { invitedUserIds: userId },
    });
  }
  findInvitesEvents(userId: string) {
    return this.eventModel.find({ invitedUserIds: userId }).exec();
  }
  acceptInvite(eventId: string, userId: string) {
    return this.eventModel.findByIdAndUpdate(eventId, {
      $pull: { invitedUserIds: userId },
    });
  }

  // ------------------------------------------------------------
  // Validators
  // ------------------------------------------------------------

  removeValidatorFromEvent(id: string, sub: any) {
    return this.eventModel.findByIdAndUpdate(id, {
      $pull: { validators: sub },
    });
  }

  addValidatorToEvent(id: string, sub: any) {
    return this.eventModel.findByIdAndUpdate(id, {
      $addToSet: { validators: sub },
    });
  }

  getEventValidators(id: string) {
    return this.eventModel.findById(id).select('validators hostId').exec();
  }

  // ------------------------------------------------------------
  // CREATE EVENT FULL
  // ------------------------------------------------------------
  async createEventFull(body: CreateFullEventDto, userId: string) {
    return this.eventModel.create({
      ...body,
      hostId: userId,
    });
  }


  getEventsByCommunityId(communityId: string) {
    return this.eventModel.find({ communityId: communityId }).exec();
  }

  // ------------------------------------------------------------
  // SUBEVENTS
  // ------------------------------------------------------------
  async findByParentEventId(parentEventId: string) {
    return this.eventModel
      .find({ parentEventId: parentEventId })
      .sort({ startDate: 1 })
      .exec();
  }

  // ------------------------------------------------------------
  // SCHEDULED RELEASE
  // ------------------------------------------------------------
  /**
   * Findet alle Events, die ein geplantes Release-Datum haben und noch nicht veröffentlicht wurden
   * @param now - Aktuelles Datum/Zeit
   * @returns Array von Events mit geplantem Release
   */
  async findEventsWithScheduledRelease(now: Date): Promise<Event[]> {
    return this.eventModel
      .find({
        scheduledReleaseDate: { $exists: true, $lte: now },
        status: { $ne: 'published' }, // Nur Events, die noch nicht veröffentlicht sind
      })
      .exec();
  }

  /**
   * Findet ein Event anhand der shortId (letzten 6 Zeichen der MongoDB ObjectId)
   * @param shortId - Die letzten 6 Zeichen der MongoDB ObjectId (z.B. "a3f9k2")
   * @returns Event oder null wenn nicht gefunden
   * 
   * Hinweis: MongoDB ObjectId kann nicht direkt mit Regex auf _id gefiltert werden.
   * Wir verwenden eine Aggregation-Pipeline, um Events zu finden, deren _id mit shortId endet.
   */
  async findByShortId(shortId: string): Promise<Event | null> {
    try {
      // Validiere shortId Format (6 Zeichen, alphanumerisch)
      if (!shortId || shortId.length !== 6 || !/^[a-f0-9]{6}$/i.test(shortId)) {
        return null;
      }

      // Verwende Aggregation, um Events zu finden, deren _id mit shortId endet
      // Ignoriere scheduledReleaseDate Filter - suche nur nach Status
      const simplePublishedFilter = {
        $and: [
          {
            $or: [
              { status: 'published' },
              { status: { $exists: false } },
            ],
          },
          {
            status: { $ne: 'draft' },
          },
        ],
      };
      
      // Zuerst ohne Filter testen, um zu sehen ob das Event existiert
      const [matchingEventWithoutFilter] = await this.eventModel.aggregate([
        {
          $addFields: {
            idString: { $toString: '$_id' },
          },
        },
        {
          $addFields: {
            idLength: { $strLenCP: '$idString' },
          },
        },
        {
          $addFields: {
            lastSixChars: {
              $substrCP: [
                '$idString',
                { $subtract: ['$idLength', 6] },
                6,
              ],
            },
          },
        },
        {
          $match: {
            lastSixChars: { $regex: new RegExp(`^${shortId}$`, 'i') },
          },
        },
        {
          $project: {
            _id: 1,
            status: 1,
            scheduledReleaseDate: 1,
            lastSixChars: 1,
          },
        },
        { $limit: 1 },
      ]);
      
      // Jetzt mit einfachem Filter (ohne scheduledReleaseDate)
      const [matchingEvent] = await this.eventModel.aggregate([
        { $match: simplePublishedFilter },
        {
          $addFields: {
            idString: { $toString: '$_id' },
          },
        },
        {
          $addFields: {
            idLength: { $strLenCP: '$idString' },
          },
        },
        {
          $addFields: {
            lastSixChars: {
              $substrCP: [
                '$idString',
                { $subtract: ['$idLength', 6] }, // Start-Index: Länge - 6
                6, // Länge: 6 Zeichen
              ],
            },
          },
        },
        {
          $match: {
            lastSixChars: { $regex: new RegExp(`^${shortId}$`, 'i') },
          },
        },
        {
          $project: {
            _id: 1, // Stelle sicher, dass _id zurückgegeben wird
          },
        },
        { $limit: 1 },
      ]);
      
      // Falls mit Filter nichts gefunden wird, aber ohne Filter schon, verwende das Event ohne Filter
      const finalMatchingEvent = matchingEvent || matchingEventWithoutFilter;

      if (!finalMatchingEvent || !finalMatchingEvent._id) {
        return null;
      }

      // Stelle sicher, dass _id ein ObjectId ist (nicht die shortId)
      const eventId = finalMatchingEvent._id.toString();
      
      // Validiere, dass es eine vollständige ObjectId ist (24 Zeichen)
      if (!eventId || eventId.length !== 24) {
        return null;
      }

      // Validiere ObjectId Format (24 hexadezimale Zeichen)
      if (!/^[a-f0-9]{24}$/i.test(eventId)) {
        return null;
      }

      // Lade vollständiges Event
      const event = await this.eventModel
        .findById(eventId)
        .select('-embedding')
        .exec();

      if (!event) {
        return null;
      }

      // Views erhöhen
      const updatedEvent = await this.eventModel
        .findOneAndUpdate(
          { _id: event._id },
          { $inc: { views: 1 } },
          { new: true, setDefaultsOnInsert: true },
        )
        .exec();

      if (!updatedEvent) {
        return null;
      }

      // Event mit Kommentar-Count laden
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

      return eventWithComments ? this.toEntity(eventWithComments) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Findet ein Event anhand des Ticket-Links (für Duplikat-Check)
   * @param ticketLink - Der Ticket-Link des Events
   * @returns Event oder null wenn nicht gefunden
   */
  async findByTicketLink(ticketLink: string): Promise<Event | null> {
    try {
      const event = await this.eventModel
        .findOne({ ticketLink })
        .select('-embedding')
        .exec();

      return event ? this.toEntity(event) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Findet ein Event anhand von Titel und Datum (für Duplikat-Check)
   * @param title - Der Titel des Events
   * @param date - Das Datum des Events
   * @returns Event oder null wenn nicht gefunden
   */
  async findByTitleAndDate(title: string, date: Date): Promise<Event | null> {
    try {
      // Suche Events mit ähnlichem Titel und gleichem Datum (Toleranz: ±1 Tag)
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const event = await this.eventModel
        .findOne({
          title: { $regex: new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
          startDate: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        })
        .select('-embedding')
        .exec();

      return event ? this.toEntity(event) : null;
    } catch (error) {
      return null;
    }
  }

 

    private escapeRegex(s: string) {
      return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    async searchArtists(query: string): Promise<string[]> {
      const q = query.trim();
      if (!q) return [];
    
      const regex = new RegExp(`^${this.escapeRegex(q)}`, 'i'); // beginnt mit
    
      const docs = await this.eventModel
        .find({ 'lineup.name': regex })
        .limit(10)
        .select('lineup.name')
        .lean()
        .exec();
    
      // optional: wirklich nur die passenden Namen zurückgeben + dedupe
      const names = docs.flatMap(d => d.lineup.map(l => l.name));
      return [...new Set(names.filter(n => regex.test(n)))].slice(0, 10);
    }
    
  }