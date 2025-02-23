import { Injectable, BadRequestException } from '@nestjs/common';
import { Event } from '../../core/domain/event';
import { MongoEventRepository } from '../../infrastructure/repositories/mongodb/event.repository';
import { ImageService } from '../../infrastructure/services/image.service';
import { UpdateEventDto } from 'src/presentation/dtos/update-event.dto';
import { GeolocationService } from 'src/infrastructure/services/geolocation.service';
import { ChatGPTService } from 'src/infrastructure/services/chatgpt.service';
@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: MongoEventRepository,
    private readonly imageService: ImageService,
    private readonly chatGptService: ChatGPTService,
    private readonly geolocationService: GeolocationService,
  ) {}
  
  
  searchByCity(city: string) {
    return this.eventRepository.searchByCity(city);
  }
  
  async findAll(): Promise<Event[]> {
    return this.eventRepository.findAll();
  }

  async findById(id: string): Promise<Event | null> {
    return this.eventRepository.findById(id);
  }

  async getEventById(id: string): Promise<Event | null> {
    return this.eventRepository.findById(id);
  }

  async getEventsByIds(ids: string[]): Promise<Event[]> {
    return this.eventRepository.getUserFavorites(ids);
  }

  async findByLocationId(locationId: string): Promise<Event[]> {
    return this.eventRepository.findByLocationId(locationId);
  }

  async findLatest(limit: number = 10): Promise<Event[]> {
    return this.eventRepository.findLatest(limit);
  }

  async findByCategory(category: string, skip: number = 0, limit: number = 10): Promise<Event[]> {
    return this.eventRepository.findByCategory(category, skip, limit);
  }

  async countByCategory(category: string): Promise<number> {
    return this.eventRepository.countByCategory(category);
  }

  async findNearbyEvents(lat: number, lon: number, distance: number): Promise<Event[]> {
    return this.eventRepository.findNearbyEvents(lat, lon, distance);
  }

  async getUserFavorites(eventIds: string[]): Promise<Event[]> {
    return this.eventRepository.getUserFavorites(eventIds);
  }

  async create(eventData: Partial<Event>): Promise<Event> {
    return this.eventRepository.create(eventData);
  }

  async createEvent(eventData: Partial<Event>, image?: Express.Multer.File): Promise<Event> {
    try {
      let imageUrl = undefined;
      
      if (image) {
        imageUrl = await this.imageService.uploadImage(image);
      }
      const eventWithImage = {
        ...eventData,
        imageUrl,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return this.eventRepository.create(eventWithImage);
    } catch (error) {
      throw new BadRequestException(`Failed to create event: ${error.message}`);
    }
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

  async processEventImageUpload(image: Express.Multer.File, lat?: number, lon?: number): Promise<Event> {
    try {
      console.info('Processing event image upload...');
      
      // 1. Upload image and get URL
      const uploadedImageUrl = await this.imageService.uploadImage(image);
      if (!uploadedImageUrl) {
        throw new BadRequestException('Failed to upload image');
      }

      // 2. Try to extract event data from image, but don't fail if it doesn't work
      let extractedEventData = {};
      try {
        extractedEventData = await this.chatGptService.extractEventFromFlyer(uploadedImageUrl);
      } catch (error) {
        console.warn('Failed to extract event data from image:', error);
      }

      // 3. Get city from coordinates if available
      let city = undefined;
      let location = undefined;
      
      if (lat && lon) {
        try {
          city = await this.geolocationService.getReverseGeocoding(lat, lon);
          
          // Format location as GeoJSON
          location = {
            type: 'Point',
            coordinates: [lon, lat], // MongoDB expects [longitude, latitude]
            city,
          };
        } catch (error) {
          console.warn('Failed to get city from coordinates:', error);
          // Still save coordinates even if city lookup fails
          location = {
            type: 'Point',
            coordinates: [lon, lat],
          };
        }
      }

      // 4. Create event with all available data
      const eventData = {
        ...extractedEventData,
        imageUrl: uploadedImageUrl,
        location,
        city,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'pending'
      };

      const createdEvent = await this.eventRepository.create(eventData);
      return createdEvent;
      
    } catch (error) {
      console.error('Failed to process event image upload:', error);
      throw new BadRequestException(`Failed to process event image: ${error.message}`);
    }
  }

  async processEventImage(imageUrl: string, lat?: number, lon?: number): Promise<any> {
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

  async findByHostId(hostId: string, skip: number = 0, limit: number = 10): Promise<Event[]> {
    return this.eventRepository.findByHostId(hostId, skip, limit);
  }

  async findEventsByHost(username: string): Promise<Event[]> {
    return this.eventRepository.findByHostUsername(username);
  }

  async findByCity(city: string, skip: number = 0, limit: number = 10): Promise<Event[]> {
    return this.eventRepository.findByCity(city, skip, limit);
  }

  async countByCity(city: string): Promise<number> {
    return this.eventRepository.countByCity(city);
  }

  async getPopularCities(limit: number = 10): Promise<{ city: string; count: number }[]> {
    return this.eventRepository.getPopularCities(limit);
  }

  async countByHostId(hostId: string): Promise<number> {
    return this.eventRepository.countByHostId(hostId);
  }

} 