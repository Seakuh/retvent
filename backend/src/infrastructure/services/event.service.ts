import * as Tesseract from 'tesseract.js';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatGPTService } from './chatgpt.service';
import { ImageService } from './image.service';
import { GeolocationService } from './geolocation.service';
import { Event } from '../../core/domain/event';
import { IEventRepository } from '../../core/repositories/event.repository.interface';
import { Inject } from '@nestjs/common';
import { Express } from 'express';
import { EventDocument } from '../../infrastructure/schemas/event.schema';
import { MongoUserRepository } from '../../infrastructure/repositories/mongodb/user.repository';
import { CreateEventDto, UpdateEventDto } from '../../core/dto/event.dto';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(
    @InjectModel('Event') private eventModel: Model<EventDocument>,
    private readonly chatGptService: ChatGPTService,
    private readonly imageService: ImageService,
    @Inject('IEventRepository')
    private readonly eventRepository: IEventRepository,
    private readonly geolocationService: GeolocationService,
    @Inject('UserRepository')
    private readonly userRepository: MongoUserRepository
  ) { }

  async processEventImage(imageUrl: string, lat?: number, lon?: number): Promise<Event> {
    const eventData: Partial<Event> = {
      imageUrl,
      title: 'Neues Event',
      description: 'Eventbeschreibung',
      date: new Date(),
      category: 'Unspecified',
      locationId: '',
      creatorId: '',
      likedBy: [],
      likesCount: 0,
      artistIds: []
    };

    return this.eventRepository.create(eventData);
  }

  async processEventImageUpload(
    image: Express.Multer.File,
    uploadLat?: number,
    uploadLon?: number
  ): Promise<Event> {
    try {
      // Nutze den ImageService um das Bild hochzuladen
      const imageUrl = await this.imageService.uploadImage(image);
      return this.processEventImage(imageUrl, uploadLat, uploadLon);
    } catch (error) {
      this.logger.error('Fehler beim Bildupload:', error);
      throw new BadRequestException('Fehler beim Bildupload: ' + error.message);
    }
  }

  async searchEvents(params: { query: string; location?: string }): Promise<Event[]> {
    // Implementierung der Suche
    return [];
  }

  async getEventById(id: string): Promise<Event | null> {
    return this.eventRepository.findById(id);
  }

  async getEventsByIds(ids: string[]): Promise<Event[]> {
    const events = await Promise.all(
      ids.map(id => this.eventRepository.findById(id))
    );
    return events.filter((event): event is Event => event !== null);
  }

  async getLatestEvents(): Promise<Event[]> {
    // Implementierung für die neuesten Events
    return [];
  }

  async findNearbyEvents(lat: number, lon: number, maxDistance: number): Promise<Event[]> {
    // Implementierung für Events in der Nähe
    return [];
  }

  async getUserFavorites(eventIds: string[]): Promise<Event[]> {
    return this.getEventsByIds(eventIds);
  }

  async createEvent(eventData: CreateEventDto & { creatorId: string }): Promise<Event> {
    const newEventData: Partial<Event> = {
      ...eventData,
      date: new Date(eventData.date),
      likedBy: [],
      likesCount: 0,
      artistIds: []
    };
    
    return this.eventRepository.create(newEventData);
  }

  async updateEvent(id: string, eventData: UpdateEventDto): Promise<Event | null> {
    const updateData: Partial<Event> = {
      ...eventData,
      ...(eventData.date && { date: new Date(eventData.date) })
    };
    
    return this.eventRepository.updateEvent(id, updateData);
  }

  // async extractTextFromImage(imageUrl: string): Promise<string> {
  //   console.info('Extracting text from image:', imageUrl);

  //   try {
  //     const { data } = await Tesseract.recognize(imageUrl, 'eng', {
  //       logger: (m) => console.log(m), // Zeigt Fortschritt an
  //     });

  //     console.info('Extracted text:', data.text);
  //     return data.text;
  //   } catch (error) {
  //     console.error('Error extracting text from image:', error);
  //     throw new Error('Text extraction failed');
  //   }
  // }

  async findLatest(limit: number): Promise<Event[]> {
    const events = await this.eventModel
      .find()
      .populate('location')
      .sort({ date: -1 })
      .limit(limit)
      .exec();
    return events.map(event => new Event(event.toObject()));
  }

  async findByCategory(category: string, skip: number, limit: number): Promise<Event[]> {
    const events = await this.eventModel
      .find({ category })
      .populate('location')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit)
      .exec();
    return events.map(event => new Event(event.toObject()));
  }

  async countByCategory(category: string): Promise<number> {
    return this.eventModel.countDocuments({ category }).exec();
  }

  async deleteEvent(id: string): Promise<boolean> {
    return this.eventRepository.delete(id);
  }

  async likeEvent(eventId: string, userId: string): Promise<void> {
    return this.eventRepository.addLike(eventId, userId);
  }

  async unlikeEvent(eventId: string, userId: string): Promise<void> {
    return this.eventRepository.removeLike(eventId, userId);
  }

  async getLikedEvents(userId: string): Promise<Event[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    return this.eventRepository.findByIds(user.likedEventIds);
  }

  async isLikedByUser(eventId: string, userId: string): Promise<boolean> {
    return this.eventRepository.isLikedByUser(eventId, userId);
  }

  async getEventsByLocation(locationId: string): Promise<Event[]> {
    return this.eventRepository.findByLocationId(locationId);
  }

  async getEventsByArtist(artistId: string): Promise<Event[]> {
    return this.eventRepository.findByArtistId(artistId);
  }

  async getUpcomingEvents(locationId: string): Promise<Event[]> {
    return this.eventRepository.findUpcoming(locationId);
  }
}