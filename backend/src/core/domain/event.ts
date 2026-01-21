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
  address?: {
    street?: string;
    houseNumber?: string;
    postalCode?: string;
    city?: string;
  };
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
  difficulty?: string;
  remoteUrl?: string;
  parentEventId?: string;
  commentsEnabled?: boolean; // Whether comments are enabled for this event
  location?: {
    city?: string;
    address?: string;
    coordinates?: {
      lat?: number;
      lon?: number;
    };
  };
  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // upload location
  uploadLat?: number;
  uploadLon?: number;

  views?: number;
  commentCount?: number;

  embedding?: number[];
  documents?: string[];

  // SEO-Felder
  slug?: string;
  citySlug?: string;
  shortDescription?: string;
  region?: string;
  country?: string;
  timezone?: string;
  categorySlug?: string;
  subcategory?: string;
  venue?: {
    name: string;
    venueId?: string;
    venueSlug?: string;
    capacity?: number;
    venueType?: 'club' | 'open-air' | 'theater' | 'stadium' | 'other';
  };
  eventType?: 'concert' | 'festival' | 'club-night' | 'theater' | 'sports' | 'workshop' | 'networking' | 'exhibition' | 'conference' | 'party' | 'comedy' | 'other';
  eventFormat?: 'live' | 'hybrid' | 'online' | 'outdoor' | 'indoor';
  genre?: ('techno' | 'house' | 'hip-hop' | 'rock' | 'pop' | 'jazz' | 'classical' | 'electronic' | 'indie' | 'other')[];
  mood?: ('energetic' | 'chill' | 'romantic' | 'party' | 'intellectual' | 'family-friendly' | 'exclusive')[];
  vibe?: {
    energy: number;        // 0-100
    intimacy: number;      // 0-100 (klein vs. groß)
    exclusivity: number;   // 0-100
    social: number;        // 0-100 (sozial vs. fokussiert)
  };
  audience?: {
    ageRange?: [number, number];
    targetAudience?: string[];
    accessibility?: {
      wheelchairAccessible?: boolean;
      hearingImpaired?: boolean;
      visualImpaired?: boolean;
    };
  };
  recurrence?: {
    pattern: 'single' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
    interval?: number;
    endDate?: Date;
    occurrences?: number;
  };
  eventSeriesId?: string;
  eventSeries?: {
    name: string;
    slug: string;
    totalEvents?: number;
  };
  similarEventIds?: string[];
  clusterId?: string;
  likeCount?: number;
  shareCount?: number;
  rsvpCount?: number;
  groupActivity?: {
    activeGroups: number;
    totalMessages?: number;
    lastActivity?: Date;
  };
  popularitySignals?: {
    trendingScore?: number;
    hotnessScore?: number;
    qualityScore?: number;
    engagementRate?: number;
  };
  organizer?: {
    name: string;
    organizerId?: string;
    organizerSlug?: string;
    verified?: boolean;
  };
  priceDetails?: {
    amount?: number;
    currency?: string;
    priceRange?: 'free' | 'low' | 'medium' | 'high' | 'premium';
    ticketTypes?: Array<{
      name: string;
      price: number;
      currency: string;
      available?: number;
      soldOut?: boolean;
    }>;
  };
  status?: 'draft' | 'published' | 'cancelled' | 'postponed';
  moderationStatus?: 'pending' | 'approved' | 'rejected';

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
