import { Injectable } from '@nestjs/common';
import { EventServicePort, SearchParams, CreateEventDto } from './ports/event-service.port';
import { Event } from '../types/event';

@Injectable()
export class EventService {
  constructor(private readonly eventServices: EventServicePort[]) {}

  async searchEvents(params: SearchParams): Promise<Event[]> {
    const allEvents = await Promise.all(
      this.eventServices.map(service => 
        service.searchEvents(params).catch(error => {
          console.error('Service search error:', error);
          return [];
        })
      )
    );

    return allEvents.flat().sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  async createEvent(event: CreateEventDto): Promise<Event> {
    // Try to create event in all services that support creation
    for (const service of this.eventServices) {
      try {
        return await service.createEvent(event);
      } catch (error) {
        console.error('Service create error:', error);
        continue;
      }
    }
    throw new Error('No service was able to create the event');
  }
}