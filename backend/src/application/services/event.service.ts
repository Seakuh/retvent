import { BadRequestException, Injectable } from '@nestjs/common';
import { ChatGPTService } from 'src/infrastructure/services/chatgpt.service';
import { GeolocationService } from 'src/infrastructure/services/geolocation.service';
import { MapEventDto } from 'src/presentation/dtos/map-event.dto';
import { UpdateEventDto } from 'src/presentation/dtos/update-event.dto';
import { Event, EventWithHost } from '../../core/domain/event';
import { MongoEventRepository } from '../../infrastructure/repositories/mongodb/event.repository';
import { ImageService } from '../../infrastructure/services/image.service';
import { ProfileService } from './profile.service';
import { UserService } from './user.service';
@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: MongoEventRepository,
    private readonly imageService: ImageService,
    private readonly chatGptService: ChatGPTService,
    private readonly geolocationService: GeolocationService,
    private readonly profileService: ProfileService,
    private readonly userService: UserService,
  ) {}
  getEventsByTag(tag: string) {
    return this.eventRepository.getEventsByTag(tag);
  }

  getPopularEventsNearby(lat: number, lon: number, limit: number) {
    return this.eventRepository.getPopularEventsNearby(lat, lon, limit);
  }

  getPopularEventsByCategory(category: string, limit: number) {
    return this.eventRepository.getPopularEventsByCategory(category, limit);
  }

  async getCategories() {
    return await this.eventRepository.getCategories();
  }
  findLatestEventsByHost(username: string) {
    return this.eventRepository.findLatestEventsByHost(username);
  }

  searchByCity(city: string) {
    return this.eventRepository.searchByCity(city);
  }

  async findAll() {
    const events = await this.eventRepository.findAllWithCommentCount();
    return events.map((event) => this.toEntity(event));
  }

  async findAllWithEmbedding(limit: number) {
    const events = await this.eventRepository.findAllWithEmbedding(limit);
    return events;
  }

  async findById(id: string) {
    const event = await this.eventRepository.findByIdWithCommentCount(id);
    return event ? this.toEntity(event) : null;
  }

  findByIdForUpdate(id: string) {
    return this.eventRepository.findById(id);
  }

  async getEventById(id: string): Promise<Event | null> {
    return this.eventRepository.findById(id);
  }

  async getEventByIdWithHostInformation(
    id: string,
  ): Promise<EventWithHost | null> {
    const event = await this.eventRepository.findById(id);
    const profile = await this.profileService.getEventProfile(event.hostId);
    return {
      ...event,
      host: profile,
    };
  }

  async getEventsByIds(ids: string[]): Promise<Event[]> {
    console.log('Getting events by ids:', ids);
    return this.eventRepository.getUserFavorites(ids);
  }

  async findByLocationId(locationId: string): Promise<Event[]> {
    return this.eventRepository.findByLocationId(locationId);
  }

  async findLatest(limit: number = 10): Promise<Event[]> {
    return this.eventRepository.findLatest(limit);
  }

  async findByIdToDelete(id: string): Promise<Event> {
    return this.eventRepository.findById(id);
  }

  async findByCategory(
    category: string,
    skip: number = 0,
    limit: number = 10,
  ): Promise<Event[]> {
    return this.eventRepository.findByCategory(category, skip, limit);
  }

  async countByCategory(category: string): Promise<number> {
    return this.eventRepository.countByCategory(category);
  }

  async findNearbyEvents(
    lat: number,
    lon: number,
    distance: number,
    limit: number,
  ): Promise<Event[]> {
    return this.eventRepository.findNearbyEvents(lat, lon, distance, limit);
  }

  async findNearbyEventsForMap(
    lat: number,
    lon: number,
    distance: number,
    limit: number,
  ): Promise<MapEventDto[]> {
    return this.eventRepository.findNearbyEventsForMap(
      lat,
      lon,
      distance,
      limit,
    );
  }

  async getUserFavorites(eventIds: string[]): Promise<Event[]> {
    return this.eventRepository.getUserFavorites(eventIds);
  }

  async create(eventData: Partial<Event>): Promise<Event> {
    return this.eventRepository.create(eventData);
  }

  async createEvent(
    eventData: Partial<Event>,
    image?: Express.Multer.File,
  ): Promise<Event> {
    try {
      let imageUrl = undefined;

      if (image) {
        imageUrl = await this.imageService.uploadImage(image);
      }
      const eventWithImage = {
        ...eventData,
        imageUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return this.eventRepository.createEventFromFormData(eventWithImage);
    } catch (error) {
      throw new BadRequestException(`Failed to create event: ${error.message}`);
    }
  }

  async findTodayEvents(): Promise<Event[]> {
    return this.eventRepository.findTodayEvents();
  }

  async update(id: string, eventData: UpdateEventDto): Promise<Event | null> {
    return this.eventRepository.update(id, eventData);
  }

  async delete(id: string): Promise<boolean> {
    return this.eventRepository.delete(id);
  }

  async addLike(eventId: string, userId: string): Promise<Event | null> {
    return this.eventRepository.addLike(eventId, userId);
  }

  async removeLike(eventId: string, userId: string): Promise<Event | null> {
    return this.eventRepository.removeLike(eventId, userId);
  }

  async processEventImageUpload(
    image: Express.Multer.File,
    lat?: number,
    lon?: number,
    userId?: string,
  ): Promise<Event> {
    try {
      // 1. Upload image and get URL
      const uploadedImageUrl = await this.imageService.uploadImage(image);
      if (!uploadedImageUrl) {
        throw new BadRequestException('Failed to upload image');
      }

      // 2. Try to extract event data from image, but don't fail if it doesn't work
      let extractedEventData = {};
      try {
        extractedEventData =
          await this.chatGptService.extractEventFromFlyer(uploadedImageUrl);
      } catch (error) {
        console.warn('Failed to extract event data from image:', error);
      }

      // 4. Create event with all available data
      const eventData = {
        ...extractedEventData,
        imageUrl: uploadedImageUrl,
        uploadLat: lat,
        uploadLon: lon,
        createdAt: new Date(),
        updatedAt: new Date(),
        location: {
          coordinates: {
            lat: lat,
            lon: lon,
          },
        },
        status: 'pending',
        hostId: userId || 'public', // Setze hostId auf userId wenn vorhanden, sonst 'public'
      };

      const createdEvent = await this.eventRepository.create(eventData);
      return createdEvent;
    } catch (error) {
      console.error('Failed to process event image upload:', error);
      throw new BadRequestException(
        `Failed to process event image: ${error.message}`,
      );
    }
  }

  async processEventImageUploadV2(
    image: Express.Multer.File,
    lat?: number,
    lon?: number,
    userId?: string,
  ): Promise<Event> {
    try {
      // 1. Upload image and get URL
      const uploadedImageUrl = await this.imageService.uploadImage(image);
      if (!uploadedImageUrl) {
        throw new BadRequestException('Failed to upload image');
      }

      // 2. Try to extract event data from image, but don't fail if it doesn't work
      let extractedEventData = {};
      try {
        extractedEventData =
          await this.chatGptService.extractEventFromFlyer(uploadedImageUrl);
      } catch (error) {
        console.warn('Failed to extract event data from image:', error);
      }

      // 4. Create event with all available data
      const eventData = {
        ...extractedEventData,
        imageUrl: uploadedImageUrl,
        uploadLat: lat,
        uploadLon: lon,
        createdAt: new Date(),
        updatedAt: new Date(),
        location: {
          coordinates: {
            lat: lat,
            lon: lon,
          },
        },
        status: 'pending',
        hostId: userId || 'public', // Setze hostId auf userId wenn vorhanden, sonst 'public'
      };

      const createdEvent = await this.eventRepository.create(eventData);
      await this.profileService.addCreatedEvent(userId, createdEvent.id);
      return createdEvent;
    } catch (error) {
      console.error('Failed to process event image upload:', error);
      throw new BadRequestException(
        `Failed to process event image: ${error.message}`,
      );
    }
  }

  async processEventImageUploadV4(
    image: Express.Multer.File,
    lat?: number,
    lon?: number,
    userId?: string,
  ): Promise<Event> {
    try {
      // 1. Upload image and get URL
      const uploadedImageUrl = await this.imageService.uploadImage(image);
      if (!uploadedImageUrl) {
        throw new BadRequestException('Failed to upload image');
      }

      // 2. Try to extract event data from image, but don't fail if it doesn't work
      let extractedEventData = {};
      try {
        extractedEventData =
          await this.chatGptService.extractEventFromFlyer(uploadedImageUrl);
      } catch (error) {
        console.warn('Failed to extract event data from image:', error);
      }

      // 4. Create event with all available data
      const eventData = {
        ...extractedEventData,
        imageUrl: uploadedImageUrl,
        uploadLat: lat,
        uploadLon: lon,
        createdAt: new Date(),
        updatedAt: new Date(),
        location: {
          coordinates: {
            lat: lat,
            lon: lon,
          },
        },
        status: 'pending',
        hostId: userId || 'public', // Setze hostId auf userId wenn vorhanden, sonst 'public'
      };

      const createdEvent = await this.eventRepository.create(eventData);
      await this.profileService.addCreatedEvent(userId, createdEvent.id);
      await this.userService.addUserPoints(userId, 20);
      return createdEvent;
    } catch (error) {
      console.error('Failed to process event image upload:', error);
      throw new BadRequestException(
        `Failed to process event image: ${error.message}`,
      );
    }
  }

  async processEventImage(
    imageUrl: string,
    lat?: number,
    lon?: number,
  ): Promise<any> {
    // Implementiere die Bildverarbeitung
    throw new BadRequestException('Not implemented yet');
  }

  async searchEvents(params: {
    query?: string;
    city?: string;
    dateRange?: { startDate: string; endDate: string };
  }): Promise<Event[]> {
    return this.eventRepository.searchEvents(params);
  }

  async findByHostId(
    hostId: string,
    skip: number = 0,
    limit: number = 10,
  ): Promise<Event[]> {
    return this.eventRepository.findByHostId(hostId, skip, limit);
  }

  async findEventsByHost(username: string): Promise<Event[]> {
    return this.eventRepository.findByHostUsername(username);
  }

  async findByCity(
    city: string,
    skip: number = 0,
    limit: number = 10,
  ): Promise<Event[]> {
    return this.eventRepository.findByCity(city, skip, limit);
  }

  async countByCity(city: string): Promise<number> {
    return this.eventRepository.countByCity(city);
  }

  async getPopularCities(
    limit: number = 10,
  ): Promise<{ city: string; count: number }[]> {
    return this.eventRepository.getPopularCities(limit);
  }

  async countByHostId(hostId: string): Promise<number> {
    return this.eventRepository.countByHostId(hostId);
  }

  private toEntity(event: any): Event {
    // Implementiere die Umwandlung von event-formatierten Daten in ein Event-Objekt
    throw new Error('Method not implemented');
  }

  // Embedding ----------------------------------------------------

  updateEmbedding(id: any, embedding: number[]) {
    return this.eventRepository.updateEmbedding(id, embedding);
  }
  findMissingEmbeddings(batchSize: number) {
    return this.eventRepository.findMissingEmbeddings(batchSize);
  }
}
