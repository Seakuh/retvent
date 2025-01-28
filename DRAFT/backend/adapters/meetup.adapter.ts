import { Injectable } from '@nestjs/common';
import { EventServicePort, SearchParams, CreateEventDto } from '../ports/event-service.port';
import { Event } from '../../types/event';
import axios from 'axios';

@Injectable()
export class MeetupAdapter implements EventServicePort {
  private readonly API_KEY = process.env.MEETUP_API_KEY;
  private readonly BASE_URL = 'https://api.meetup.com';

  async searchEvents(params: SearchParams): Promise<Event[]> {
    try {
      const { data } = await axios.get(`${this.BASE_URL}/find/upcoming_events`, {
        params: {
          key: this.API_KEY,
          text: params.keyword,
          city: params.city,
          category: params.category,
        }
      });

      return this.mapEvents(data.events || []);
    } catch (error) {
      console.error('Meetup search error:', error);
      return [];
    }
  }

  async createEvent(event: CreateEventDto): Promise<Event> {
    try {
      const { data } = await axios.post(
        `${this.BASE_URL}/2/event`,
        this.mapCreateEventDto(event),
        { params: { key: this.API_KEY } }
      );
      return this.mapEvents([data])[0];
    } catch (error) {
      console.error('Meetup create error:', error);
      throw error;
    }
  }

  private mapEvents(events: any[]): Event[] {
    return events.map(event => ({
      id: event.id,
      name: event.name,
      date: event.local_date,
      location: event.venue?.name || 'TBA',
      description: event.description,
      imageUrl: event.featured_photo?.photo_link,
      category: event.group?.category?.name,
      price: event.fee ? `${event.fee.amount} ${event.fee.currency}` : 'Free'
    }));
  }

  private mapCreateEventDto(event: CreateEventDto): any {
    return {
      name: event.name,
      description: event.description,
      local_date: event.date,
      venue_id: event.location, // Requires a valid venue ID
      duration: 7200000 // 2 hours in milliseconds
    };
  }
}