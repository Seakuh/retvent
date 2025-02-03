import { Event } from '../domain/event';

export class CreateEventDto {
  title: string;
  description: string;
  date: string | Date;
  location: string;
  category: string;
  imageUrl: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export class UpdateEventDto {
  title?: string;
  description?: string;
  date?: string | Date;
  location?: string;
  category?: string;
  imageUrl?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Helper function für die Konvertierung
export function convertToEventData(dto: CreateEventDto | UpdateEventDto): Partial<Event> {
  const { location, coordinates, date, ...rest } = dto;
  const eventData: Partial<Event> = {
    ...rest,
    locationId: location,
    ...(date && { date: new Date(date) })
  };
  
  return eventData;
} 