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

  coordinates?: {
    lat?: number;
    lng?: number;
  };
  // Beziehungen
  hostId: string;
  hostUsername?: string;
  city?: string;
  locationId?: string;
  category?: string;
  price?: string;
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
  location?: {
    city?: string;
    address?: string;
    coordinates?: {
      lat?: number;
      lng?: number;
    };
  };
  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // upload location
  uploadLat?: number;
  uploadLon?: number;

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
