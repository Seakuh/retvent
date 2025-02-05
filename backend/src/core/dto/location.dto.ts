import { Location } from '../domain/location';

export class CreateLocationDto {
  name: string;
  description: string;
  logoUrl: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  website?: string;
  socialMediaLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}

export class UpdateLocationDto implements Partial<Omit<Location, 'id' | 'createdAt' | 'updatedAt'>> {
  name?: string;
  description?: string;
  logoUrl?: string;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  website?: string;
  socialMediaLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
} 