import { IEvent } from './interfaces/event.interface';

export class Event implements IEvent {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  
  // Zeitliche Daten
  startDate: Date;
  startTime: string;
  endDate?: Date;
  endTime?: string;
  
  // Beziehungen
  organizerId: string;
  locationId: string;
  artistIds: string[] = [];
  likeIds: string[] = [];
  
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