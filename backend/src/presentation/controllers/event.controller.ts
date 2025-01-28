// src/presentation/controllers/event.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { EventServicePort } from '../../core/domain/event';
import { MeetupService } from '../../infrastructure/services/meetup.service';
import { ChatGPTService } from '../../infrastructure/services/chatgpt.service';
import { EventService } from 'src/infrastructure/services/event.service';

@Controller('events')
export class EventController {
  constructor(
    private readonly meetupService: MeetupService,
    private readonly chatGPTService: ChatGPTService,
    private readonly eventService: EventService
  ) {}

  @Get('search')
  async searchEvents(@Query('query') query: string, @Query('location') location?: string): Promise<any> {
    const params = { query, location };
    const meetupEvents = await this.meetupService.searchEvents(params);
    // const chatGPTEvents = await this.chatGPTService.searchEvents(params);
    // return [...meetupEvents, ...chatGPTEvents];
    return [...meetupEvents];

  }
}