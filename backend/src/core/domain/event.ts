import { IEvent } from './interfaces/event.interface';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  imageUrl: string;
  category: string;
  locationId: string;
  creatorId: string;
  likedBy: string[];
  likesCount: number;
  artistIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class Event implements Event {
  constructor(data: Partial<Event>) {
    Object.assign(this, data);
    // Konvertiere date String zu Date Objekt wenn nötig
    if (data.date && typeof data.date === 'string') {
      this.date = new Date(data.date);
    }
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