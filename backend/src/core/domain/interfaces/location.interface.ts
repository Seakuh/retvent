export interface ILocation {
  id: string;
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
  ownerId: string;
  eventIds: string[];
  followerIds: string[];
  likeIds: string[];
  eventsCount: number;
  createdAt: Date;
  updatedAt: Date;
} 