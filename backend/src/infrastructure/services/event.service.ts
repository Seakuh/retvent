import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from '../../core/domain/event';
import { ChatGPTService } from './chatgpt.service';
import { ImageService } from './image.service';

@Injectable()
export class EventService {
  constructor(
    @InjectModel('Event') private eventModel: Model<Event>,
    private readonly chatGptService: ChatGPTService,
    private readonly imageService: ImageService,
  ) {}
  async processEventImage(imageUrl: string, lat?: number, lon?: number) {
    console.info('Processing event image:', imageUrl, lat, lon);
    const uploadedImageUrl = await this.imageService.uploadImage(imageUrl);
    const extractedText = await this.extractTextFromImage(uploadedImageUrl);
    const event = await this.chatGptService.generateEventFromText(extractedText);
    const createdEvent = await this.eventModel.create({ ...event, lat, lon, imageUrl: uploadedImageUrl });
    return createdEvent;
  }

  async extractTextFromImage(imageUrl: string): Promise<string> {
    return 'coworking party 12:23 am bei der blauen lagune mit DJ Bobo';
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