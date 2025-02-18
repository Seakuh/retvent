import { Injectable, BadRequestException } from '@nestjs/common';
import { Event } from '../../core/domain/event';
import { MongoEventRepository } from '../../infrastructure/repositories/mongodb/event.repository';
import { ImageService } from '../../infrastructure/services/image.service';

@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: MongoEventRepository,
    private readonly imageService: ImageService
  ) {}


  
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

  async update(id: string, eventData: Partial<Event>): Promise<Event | null> {
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

  async processEventImageUpload(image: Express.Multer.File, lat?: number, lon?: number): Promise<any> {
    // Implementiere die Bildverarbeitung
    throw new BadRequestException('Not implemented yet');
  }

  async processEventImage(imageUrl: string, lat?: number, lon?: number): Promise<any> {
    // Implementiere die Bildverarbeitung
    throw new BadRequestException('Not implemented yet');
  }

  async searchEvents(params: { query: string; location?: string }): Promise<Event[]> {
    // Implementiere die Suche
    return this.eventRepository.findAll(); // Vorläufig alle Events zurückgeben
  }

  async findByHostId(hostId: string): Promise<Event[]> {
    return this.eventRepository.findByHostId(hostId);
  }
} 