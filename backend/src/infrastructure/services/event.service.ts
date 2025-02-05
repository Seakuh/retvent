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



@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(
    @InjectModel('Event') private eventModel: Model<Event>,
    private readonly chatGptService: ChatGPTService,
    private readonly imageService: ImageService,
    @Inject('IEventRepository')
    private readonly eventRepository: IEventRepository,
    private readonly geolocationService: GeolocationService,
  ) { }

  async processEventImage(imageUrl: string, lat?: number, lon?: number): Promise<Event> {
    // Hier würde die Bildverarbeitung stattfinden
    const eventData: Partial<Event> = {
      imageUrl,
      title: 'Neues Event', // Placeholder
      description: 'Eventbeschreibung', // Placeholder
      startDate: new Date(),
      startTime: '18:00',
      locationId: '', // Muss später gesetzt werden
      organizerId: '', // Muss später gesetzt werden
    };

    if (lat && lon) {
      // Hier könnte man die nächstgelegene Location suchen und setzen
    }

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

  async createEvent(eventData: Partial<Event>, image?: Express.Multer.File): Promise<Event> {
    let imageUrl = eventData.imageUrl;
    
    if (image) {
      try {
        // Nutze den ImageService um das Bild hochzuladen
        imageUrl = await this.imageService.uploadImage(image);
      } catch (error) {
        this.logger.error('Fehler beim Bildupload:', error);
        throw new BadRequestException('Fehler beim Bildupload: ' + error.message);
      }
    }

    const newEventData = {
      ...eventData,
      imageUrl,
    };

    return this.eventRepository.create(newEventData);
  }

  async updateEvent(eventId: string, updateData: any, image?: Express.Multer.File) {
    const existingEvent = await this.eventRepository.findById(eventId);
    if (!existingEvent) {
      throw new NotFoundException('Event nicht gefunden');
    }

    let imageUrl = updateData.imageUrl;

    if (image) {
      try {
        // Nutze den ImageService um das neue Bild hochzuladen
        imageUrl = await this.imageService.uploadImage(image);
      } catch (error) {
        this.logger.error('Fehler beim Bildupload:', error);
        throw new BadRequestException('Fehler beim Bildupload: ' + error.message);
      }
    }

    const updatedEvent = await this.eventRepository.updateEvent(eventId, {
      ...updateData,
      imageUrl,
    });

    if (!updatedEvent) {
      throw new NotFoundException('Event nicht gefunden');
    }
    return updatedEvent;
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
    return this.eventModel
      .find()
      .populate('location')
      .sort({ date: -1 })
      .limit(limit)
      .exec();
  }

  async findByCategory(category: string, skip: number, limit: number): Promise<Event[]> {
    return this.eventModel
      .find({ category })
      .populate('location')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async countByCategory(category: string): Promise<number> {
    return this.eventModel.countDocuments({ category }).exec();
  }
}