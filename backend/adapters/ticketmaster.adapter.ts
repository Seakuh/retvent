import { Injectable } from '@nestjs/common';
import { EventServicePort, SearchParams, CreateEventDto } from '../ports/event-service.port';
import { Event } from '../../types/event';
import axios from 'axios';

@Injectable()
export class TicketmasterAdapter implements EventServicePort {
  private readonly API_KEY = process.env.TICKETMASTER_API_KEY;
  private readonly BASE_URL = 'https://app.ticketmaster.com/discovery/v2';

  async searchEvents(params: SearchParams): Promise<Event[]> {
    const queryParams = new URLSearchParams({
      apikey: this.API_KEY,
      keyword: params.keyword || '',
      city: params.city || '',
      classificationName: params.category || '',
    });

    try {
      const { data } = await axios.get(`${this.BASE_URL}/events.json?${queryParams}`);
      return this.mapEvents(data._embedded?.events || []);
    } catch (error) {
      console.error('Ticketmaster search error:', error);
      return [];
    }
  }

  async createEvent(event: CreateEventDto): Promise<Event> {
    throw new Error('Ticketmaster API does not support event creation');
  }

  private mapEvents(events: any[]): Event[] {
    return events.map(event => ({
      id: event.id,
      name: event.name,
      date: event.dates.start.localDate,
      location: event._embedded?.venues[0]?.name || 'Location TBA',
      description: event.description || 'No description available',
      imageUrl: event.images[0]?.url,
      category: event.classifications[0]?.segment?.name,
      price: event.priceRanges ? 
        `${event.priceRanges[0].min} - ${event.priceRanges[0].max} ${event.priceRanges[0].currency}` : 
        'Price TBA'
    }));
  }
}