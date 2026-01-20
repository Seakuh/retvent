import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
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

class LocationDto {
  @IsString()
  address: string;

  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates: CoordinatesDto;
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

}
