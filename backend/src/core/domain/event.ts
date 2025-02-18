import { IEvent } from './interfaces/event.interface';

export class Event implements IEvent {
  // ID
  id: string;
  // Titel
  title: string;
  // Beschreibung
  description?: string;
  // Bild URL
  imageUrl?: string;
  // Zeitliche Daten
  startDate: Date;
  startTime: string;
  endDate?: Date;
  endTime?: string;
  
  // Beziehungen
  hostId: string;
  locationId?: string;
  category?: string;
  price?: number;
  ticketLink?: string;
  lineup?: Array<{ name: string; role?: string; startTime?: string }>;
  socialMediaLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  tags?: string[];
  website?: string;
  likeIds?: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<IEvent>) {
    Object.assign(this, data);
  }
}

export interface SearchParams {
  query: string;
  location?: string;
  dateRange?: { start: string; end: string };
}

export interface EventServicePort {
  searchEvents(params: SearchParams): Promise<Event[]>;
}