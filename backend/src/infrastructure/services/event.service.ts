import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from '../../core/domain/event';
import { ChatGPTService } from './chatgpt.service';

@Injectable()
export class EventService {
  constructor(
    @InjectModel('Event') private eventModel: Model<Event>,
    private readonly chatGptService: ChatGPTService,
  ) {}

  async processEventImage(imageUrl: string, lat?: number, lon?: number) {
    const extractedText = await this.extractTextFromImage(imageUrl);
    const event : Event = await this.chatGptService.generateEventFromText(extractedText);
    const createdEvent = await this.eventModel.create({ ...event, lat, lon });
    return createdEvent;
  }

  async extractTextFromImage(imageUrl: string): Promise<string> {
    // Hier könnte ein OCR-Service wie Tesseract oder Google Vision genutzt werden
    return 'Extracted text from flyer...';
  }

  async searchEvents(params: { query: string; location?: string }) {
    const filter: any = { name: new RegExp(params.query, 'i') };
    if (params.location) filter.location = new RegExp(params.location, 'i');
    return this.eventModel.find(filter);
  }

  async getEventById(id: string) {
    return this.eventModel.findById(id);
  }

  async getEventsByIds(ids: string[]) {
    return this.eventModel.find({ _id: { $in: ids } });
  }
}