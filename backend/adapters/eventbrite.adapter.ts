import { Injectable } from '@nestjs/common';
import { EventServicePort, SearchParams, CreateEventDto } from '../ports/event-service.port';
import { Event } from '../../types/event';
import axios from 'axios';

@Injectable()
export class EventbriteAdapter implements EventServicePort {
  private readonly API_KEY = process.env.EVENTBRITE_API_KEY;
  private readonly BASE_URL = 'https://www.eventbriteapi.com/v3';

  async searchEvents(params: SearchParams): Promise<Event[]> {
    try {
      const { data } = await axios.get(`${this.BASE_URL}/events/search`, {
        headers: { 'Authorization': `Bearer ${this.API_KEY}` },
        params: {
          q: params.keyword,
          'location.address': params.city,
          categories: params.category,
        }
      });

      return this.mapEvents(data.events || []);
    } catch (error) {
      console.error('Eventbrite search error:', error);
      return [];
    }
  }

  async createEvent(event: CreateEventDto): Promise<Event> {
    try {
      const { data } = await axios.post(
        `${this.BASE_URL}/events/`,
        this.mapCreateEventDto(event),
        { headers: { 'Authorization': `Bearer ${this.API_KEY}` } }
      );
      return this.mapEvents([data])[0];
    } catch (error) {
      console.error('Eventbrite create error:', error);
      throw error;
    }
  }

  private mapEvents(events: any[]): Event[] {
    return events.map(event => ({
      id: event.id,
      name: event.name.text,
      date: event.start.local,
      location: event.venue?.name || 'TBA',
      description: event.description.text,
      imageUrl: event.logo?.url,
      category: event.category?.name,
      price: event.ticket_classes?.[0]?.cost?.display || 'Free'
    }));
  }

  private mapCreateEventDto(event: CreateEventDto): any {
    return {
      event: {
        name: { text: event.name },
        description: { text: event.description },
        start: { timezone: 'UTC', local: event.date },
        end: { timezone: 'UTC', local: event.date },
        currency: 'EUR'
      }
    };
  }
}