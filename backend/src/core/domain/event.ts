import { IEvent } from './interfaces/event.interface';
import { ProfileEventDetail } from './profile';
export class Event implements IEvent {
  // ID
  id: string;
  // Titel
  title: string;
  // Beschreibung
  description?: string;
  // Bild URL
  imageUrl?: string;
  communityId?: string;
  // Zeitliche Daten
  startDate: Date;
  startTime: string;
  endDate?: Date;
  isSponsored?: boolean;
  endTime?: string;
  // Beziehungen
  hostId: string;
  hostUsername?: string;
  hostImageUrl?: string;
  city?: string;
  locationId?: string;
  category?: string;
  price?: string;
  ticketLink?: string;
  lineup?: Array<{
    name: string;
    role?: string;
    startTime?: string;
    endTime?: string;
  }>;
  socialMediaLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  isPrivate?: boolean;
  validators?: string[];
  tags?: string[];
  website?: string;
  likeIds?: string[];
  capacity?: number;
  eventPictures?: string[];
  lineupPictureUrl?: string[];
  videoUrls?: string[];
  regenstrations: number;
  registeredUserIds?: string[];
  email?: string;
  language?: string;
  galleryUrls?: string[];
  documentUrls?: string[];
  difficulty?: string;
  remoteUrl?: string;
  subEvntIds?: string[];
  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // upload location
  uploadLat?: number;
  uploadLon?: number;

  views?: number;
  commentCount?: number;

  embedding?: number[];

  // SubEvent Support
  parentEventId?: string;
  subEventIds?: string[];


  constructor(data: Partial<IEvent>) {
    Object.assign(this, data);
  }
}

export interface EventWithHost extends Event {
  host: ProfileEventDetail;
}

export interface SearchParams {
  query: string;
  location?: string;
  dateRange?: { start: string; end: string };
}

export interface EventServicePort {
  searchEvents(params: SearchParams): Promise<Event[]>;
}
