import { ILocation } from './interfaces/location.interface';

export class Location implements ILocation {
  id: string;
  name: string;
  logoUrl: string;
  
  // Kontakt & Social Media
  website?: string;
  whatsappGroupLink?: string;
  youtubeLink?: string;
  socialMediaLinks: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  
  // GPS
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: string;
  
  // Beziehungen als IDs
  eventIds: string[] = [];
  followerIds: string[] = [];
  likeIds: string[] = [];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  ownerId: string;

  constructor(data: Partial<ILocation>) {
    Object.assign(this, data);
  }
} 