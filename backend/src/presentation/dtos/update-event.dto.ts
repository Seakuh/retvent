import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class SocialMediaLinksDto {
  @IsUrl()
  @IsOptional()
  instagram?: string;

  @IsUrl()
  @IsOptional()
  facebook?: string;

  @IsUrl()
  @IsOptional()
  twitter?: string;
}

class LineupArtistDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  startTime?: string;
}

class CoordinatesDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

class AddressDto {
  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  houseNumber?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

class LocationDto {
  @IsString()
  address: string;

  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates: CoordinatesDto;
}

class VenueDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  venueId?: string;

  @IsOptional()
  @IsString()
  venueSlug?: string;

  @IsOptional()
  @IsNumber()
  capacity?: number;

  @IsOptional()
  @IsEnum(['club', 'open-air', 'theater', 'stadium', 'other'])
  venueType?: 'club' | 'open-air' | 'theater' | 'stadium' | 'other';
}

class VibeDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  energy: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  intimacy: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  exclusivity: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  social: number;
}

class AccessibilityDto {
  @IsOptional()
  @IsBoolean()
  wheelchairAccessible?: boolean;

  @IsOptional()
  @IsBoolean()
  hearingImpaired?: boolean;

  @IsOptional()
  @IsBoolean()
  visualImpaired?: boolean;
}

class AudienceDto {
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  ageRange?: [number, number];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetAudience?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => AccessibilityDto)
  accessibility?: AccessibilityDto;
}

class RecurrenceDto {
  @IsEnum(['single', 'daily', 'weekly', 'monthly', 'yearly', 'custom'])
  pattern: 'single' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

  @IsOptional()
  @IsNumber()
  interval?: number;

  @IsOptional()
  endDate?: Date;

  @IsOptional()
  @IsNumber()
  occurrences?: number;
}

class EventSeriesDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsNumber()
  totalEvents?: number;
}

class TicketTypeDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsString()
  currency: string;

  @IsOptional()
  @IsNumber()
  available?: number;

  @IsOptional()
  @IsBoolean()
  soldOut?: boolean;
}

class PriceDto {
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(['free', 'low', 'medium', 'high', 'premium'])
  priceRange?: 'free' | 'low' | 'medium' | 'high' | 'premium';

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketTypeDto)
  ticketTypes?: TicketTypeDto[];
}

class GroupActivityDto {
  @IsNumber()
  activeGroups: number;

  @IsOptional()
  @IsNumber()
  totalMessages?: number;

  @IsOptional()
  lastActivity?: Date;
}

class PopularitySignalsDto {
  @IsOptional()
  @IsNumber()
  trendingScore?: number;

  @IsOptional()
  @IsNumber()
  hotnessScore?: number;

  @IsOptional()
  @IsNumber()
  qualityScore?: number;

  @IsOptional()
  @IsNumber()
  engagementRate?: number;
}

class OrganizerDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  organizerId?: string;

  @IsOptional()
  @IsString()
  organizerSlug?: string;

  @IsOptional()
  @IsBoolean()
  verified?: boolean;
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  communityId?: string;

  @IsOptional()
  @IsString()
  startDate?: string | Date;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endDate?: string | Date;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  hostId?: string;

  @IsOptional()
  @IsString()
  hostUsername?: string;


  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  price?: string;

  @IsOptional()
  ticketLink?: string;


  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  website?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  likeIds?: string[];

  @IsOptional()
  @IsNumber()
  capacity?: number;




  @IsOptional()
  email?: string;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;

  @IsOptional()
  @IsNumber()
  uploadLat?: number;

  @IsOptional()
  @IsObject()
  host?: {
    profileImageUrl: string;
    username: string;
  };

  @IsOptional()
  @IsNumber()
  uploadLon?: number;

  @IsOptional()
  @IsObject()
  socialMediaLinks?: {
    instagram?: string;

    facebook?: string;

    twitter?: string;
  };

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  validators?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  lineupPictureUrl?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  videoUrls?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineupArtistDto)
  lineup?: LineupArtistDto[];

  @IsOptional()
  @IsBoolean()
  commentsEnabled?: boolean;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsOptional()
  @IsUrl()
  remoteUrl?: string;

  @IsOptional()
  @IsString()
  parentEventId?: string;

  // ========== NEUE SEO-FELDER (optional, abwärtskompatibel) ==========
  
  // URL-Struktur
  @IsOptional()
  @IsString()
  slug?: string;                 // URL-freundlich (z.B. "techno-party-berlin-2024")
  
  @IsOptional()
  @IsString()
  citySlug?: string;             // URL-freundlich (z.B. "berlin")
  
  // Beschreibungen
  @IsOptional()
  @IsString()
  shortDescription?: string;     // Meta-Description (max 160 Zeichen)
  
  // Geografische Daten
  @IsOptional()
  @IsString()
  region?: string;              // Bundesland/Region

  @IsOptional()
  @IsString()
  regionId?: string;            // Referenz zur Region-Collection
  
  @IsOptional()
  @IsString()
  country?: string;             // Land (z.B. "Deutschland")
  
  @IsOptional()
  @ValidateNested()
  @Type(() => VenueDto)
  venue?: VenueDto;                 // Venue-Informationen
  
  // Zeitliche Daten
  @IsOptional()
  @IsString()
  timezone?: string;             // Zeitzone (z.B. "Europe/Berlin")
  
  // Kategorisierung
  @IsOptional()
  @IsString()
  categorySlug?: string;         // URL-freundlich
  
  @IsOptional()
  @IsString()
  subcategory?: string;         // Unterkategorie
  
  // ========== SEMANTISCHE FELDER FÜR KI (optional) ==========
  
  @IsOptional()
  @IsEnum(['concert', 'festival', 'club-night', 'theater', 'sports', 'workshop', 'networking', 'exhibition', 'conference', 'party', 'comedy', 'other'])
  eventType?: 'concert' | 'festival' | 'club-night' | 'theater' | 'sports' | 'workshop' | 'networking' | 'exhibition' | 'conference' | 'party' | 'comedy' | 'other';
  
  @IsOptional()
  @IsEnum(['live', 'hybrid', 'online', 'outdoor', 'indoor'])
  eventFormat?: 'live' | 'hybrid' | 'online' | 'outdoor' | 'indoor';
  
  @IsOptional()
  @IsArray()
  @IsEnum(['techno', 'house', 'hip-hop', 'rock', 'pop', 'jazz', 'classical', 'electronic', 'indie', 'other'], { each: true })
  genre?: ('techno' | 'house' | 'hip-hop' | 'rock' | 'pop' | 'jazz' | 'classical' | 'electronic' | 'indie' | 'other')[];
  
  @IsOptional()
  @IsArray()
  @IsEnum(['energetic', 'chill', 'romantic', 'party', 'intellectual', 'family-friendly', 'exclusive'], { each: true })
  mood?: ('energetic' | 'chill' | 'romantic' | 'party' | 'intellectual' | 'family-friendly' | 'exclusive')[];
  
  @IsOptional()
  @ValidateNested()
  @Type(() => VibeDto)
  vibe?: VibeDto;
  
  @IsOptional()
  @ValidateNested()
  @Type(() => AudienceDto)
  audience?: AudienceDto;
  
  @IsOptional()
  @ValidateNested()
  @Type(() => RecurrenceDto)
  recurrence?: RecurrenceDto;
  
  @IsOptional()
  @IsString()
  eventSeriesId?: string;
  
  @IsOptional()
  @ValidateNested()
  @Type(() => EventSeriesDto)
  eventSeries?: EventSeriesDto;
  
  // Ähnliche Events (KI-generiert)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  similarEventIds?: string[];
  
  @IsOptional()
  @IsString()
  clusterId?: string;
  
  // ========== COMMUNITY-FELDER (optional) ==========
  
  @IsOptional()
  @IsNumber()
  likeCount?: number;            // Anzahl Likes (alternativ zu likeIds?.length)
  
  @IsOptional()
  @IsNumber()
  shareCount?: number;          // Anzahl Shares
  
  @IsOptional()
  @IsNumber()
  rsvpCount?: number;           // Anzahl RSVPs
  
  @IsOptional()
  @ValidateNested()
  @Type(() => GroupActivityDto)
  groupActivity?: GroupActivityDto;
  
  @IsOptional()
  @ValidateNested()
  @Type(() => PopularitySignalsDto)
  popularitySignals?: PopularitySignalsDto;
  
  // ========== ORGANISATOR (optional) ==========
  
  @IsOptional()
  @ValidateNested()
  @Type(() => OrganizerDto)
  organizer?: OrganizerDto;
  
  // ========== COMMERZIELLE FELDER (optional) ==========
  
  @IsOptional()
  @ValidateNested()
  @Type(() => PriceDto)
  priceDetails?: PriceDto;         // Strukturierte Preisinformationen (alternativ zu price string)
  
  // ========== TECHNISCHE FELDER (optional) ==========
  
  @IsOptional()
  @IsEnum(['draft', 'published', 'cancelled', 'postponed'])
  status?: 'draft' | 'published' | 'cancelled' | 'postponed';
  
  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected'])
  moderationStatus?: 'pending' | 'approved' | 'rejected';

  @IsOptional()
  @IsDateString()
  scheduledReleaseDate?: Date | string; // Geplantes Release-Datum für automatische Veröffentlichung

}
