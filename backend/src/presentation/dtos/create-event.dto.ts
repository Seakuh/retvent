import {
  IsString, IsOptional, IsArray, IsUrl, ValidateNested,
  IsNumber, Matches, IsDateString, IsObject, IsBoolean,
  IsEnum, Min, Max, ArrayMinSize
} from 'class-validator';
import { Type } from 'class-transformer';

// Social Media Links
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

// Lineup Artist
class LineupArtistDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: 'startTime must be in format HH:mm' })
  startTime?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: 'endTime must be in format HH:mm' })
  endTime?: string;
}

// Address
class AddressDto {
  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  houseNumber?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  city?: string;
}

// Location with Coordinates
class LocationDto {
  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsObject()
  @IsOptional()
  coordinates?: {
    lat?: number;
    lon?: number;
  };
}

// Venue
class VenueDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  venueId?: string;

  @IsString()
  @IsOptional()
  venueSlug?: string;

  @IsNumber()
  @IsOptional()
  capacity?: number;

  @IsEnum(['club', 'open-air', 'theater', 'stadium', 'other'])
  @IsOptional()
  venueType?: 'club' | 'open-air' | 'theater' | 'stadium' | 'other';
}

// Vibe Details
class VibeDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  energy?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  intimacy?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  exclusivity?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  social?: number;
}

// Accessibility
class AccessibilityDto {
  @IsBoolean()
  @IsOptional()
  wheelchairAccessible?: boolean;

  @IsBoolean()
  @IsOptional()
  hearingImpaired?: boolean;

  @IsBoolean()
  @IsOptional()
  visualImpaired?: boolean;
}

// Audience
class AudienceDto {
  @IsArray()
  @IsOptional()
  ageRange?: [number, number];

  @IsArray()
  @IsOptional()
  targetAudience?: string[];

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => AccessibilityDto)
  accessibility?: AccessibilityDto;
}

// Recurrence
class RecurrenceDto {
  @IsEnum(['single', 'daily', 'weekly', 'monthly', 'yearly', 'custom'])
  pattern: 'single' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

  @IsNumber()
  @IsOptional()
  interval?: number;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  occurrences?: number;
}

// Event Series
class EventSeriesDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsNumber()
  @IsOptional()
  totalEvents?: number;
}

// Organizer
class OrganizerDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  organizerId?: string;

  @IsString()
  @IsOptional()
  organizerSlug?: string;

  @IsBoolean()
  @IsOptional()
  verified?: boolean;
}

// Ticket Type
class TicketTypeDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsString()
  currency: string;

  @IsNumber()
  @IsOptional()
  available?: number;

  @IsBoolean()
  @IsOptional()
  soldOut?: boolean;
}

// Price Details
class PriceDetailsDto {
  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(['free', 'low', 'medium', 'high', 'premium'])
  @IsOptional()
  priceRange?: 'free' | 'low' | 'medium' | 'high' | 'premium';

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TicketTypeDto)
  ticketTypes?: TicketTypeDto[];
}

// Popularity Signals
class PopularitySignalsDto {
  @IsNumber()
  @IsOptional()
  trendingScore?: number;

  @IsNumber()
  @IsOptional()
  hotnessScore?: number;

  @IsNumber()
  @IsOptional()
  qualityScore?: number;

  @IsNumber()
  @IsOptional()
  engagementRate?: number;
}

// Group Activity
class GroupActivityDto {
  @IsNumber()
  activeGroups: number;

  @IsNumber()
  @IsOptional()
  totalMessages?: number;

  @IsDateString()
  @IsOptional()
  lastActivity?: string;
}

// Main DTO
export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  startDate: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'startTime must be in format HH:mm'
  })
  startTime: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'endTime must be in format HH:mm'
  })
  endTime?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  communityId?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  price?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  ticketLink?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LineupArtistDto)
  lineup?: LineupArtistDto[];

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialMediaLinksDto)
  socialMediaLinks?: SocialMediaLinksDto;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsArray()
  @IsOptional()
  validators?: string[];

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  @IsUrl()
  website?: string;

  @IsNumber()
  @IsOptional()
  capacity?: number;

  @IsArray()
  @IsOptional()
  eventPictures?: string[];

  @IsArray()
  @IsOptional()
  lineupPictureUrl?: string[];

  @IsArray()
  @IsOptional()
  videoUrls?: string[];

  @IsArray()
  @IsOptional()
  registeredUserIds?: string[];

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  difficulty?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  remoteUrl?: string;

  @IsString()
  @IsOptional()
  parentEventId?: string;

  @IsBoolean()
  @IsOptional()
  commentsEnabled?: boolean;

  @IsNumber()
  @IsOptional()
  uploadLat?: number;

  @IsNumber()
  @IsOptional()
  uploadLon?: number;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  citySlug?: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  regionId?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  categorySlug?: string;

  @IsString()
  @IsOptional()
  subcategory?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => VenueDto)
  venue?: VenueDto;

  @IsEnum(['concert', 'festival', 'club-night', 'theater', 'sports', 'workshop', 'networking', 'exhibition', 'conference', 'party', 'comedy', 'other'])
  @IsOptional()
  eventType?: 'concert' | 'festival' | 'club-night' | 'theater' | 'sports' | 'workshop' | 'networking' | 'exhibition' | 'conference' | 'party' | 'comedy' | 'other';

  @IsEnum(['live', 'hybrid', 'online', 'outdoor', 'indoor'])
  @IsOptional()
  eventFormat?: 'live' | 'hybrid' | 'online' | 'outdoor' | 'indoor';

  @IsArray()
  @IsOptional()
  genre?: ('techno' | 'house' | 'hip-hop' | 'rock' | 'pop' | 'jazz' | 'classical' | 'electronic' | 'indie' | 'other')[];

  @IsArray()
  @IsOptional()
  mood?: ('energetic' | 'chill' | 'romantic' | 'party' | 'intellectual' | 'family-friendly' | 'exclusive')[];

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => VibeDto)
  vibe?: VibeDto;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => AudienceDto)
  audience?: AudienceDto;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => RecurrenceDto)
  recurrence?: RecurrenceDto;

  @IsString()
  @IsOptional()
  eventSeriesId?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => EventSeriesDto)
  eventSeries?: EventSeriesDto;

  @IsArray()
  @IsOptional()
  similarEventIds?: string[];

  @IsString()
  @IsOptional()
  clusterId?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => OrganizerDto)
  organizer?: OrganizerDto;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => PriceDetailsDto)
  priceDetails?: PriceDetailsDto;

  @IsEnum(['draft', 'published', 'cancelled', 'postponed'])
  @IsOptional()
  status?: 'draft' | 'published' | 'cancelled' | 'postponed';

  @IsEnum(['pending', 'approved', 'rejected'])
  @IsOptional()
  moderationStatus?: 'pending' | 'approved' | 'rejected';

  @IsDateString()
  @IsOptional()
  scheduledReleaseDate?: string;

  @IsBoolean()
  @IsOptional()
  isSponsored?: boolean;
}
