export class EventSearchDto {
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
  hostUsername?: string;
  city?: string;
  locationId?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
  views?: number;
  commentCount?: number;
  meta?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export class EventSearchResponseDto {
  events: EventSearchDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
