import { Event } from '../../types/event';

export interface EventServicePort {
  searchEvents(params: SearchParams): Promise<Event[]>;
  createEvent(event: CreateEventDto): Promise<Event>;
}

export interface SearchParams {
  keyword?: string;
  city?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateEventDto {
  name: string;
  date: string;
  location: string;
  description: string;
  category?: string;
  price?: string;
  imageUrl?: string;
}