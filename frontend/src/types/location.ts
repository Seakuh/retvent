export interface Location {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  address: string;
  eventsCount: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  socialMediaLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  isFollowed?: boolean;
} 