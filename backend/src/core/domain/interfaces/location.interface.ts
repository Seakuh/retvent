export interface ILocation {
  id: string;
  name: string;
  logoUrl: string;
  website?: string;
  whatsappGroupLink?: string;
  youtubeLink?: string;
  socialMediaLinks: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: string;
  ownerId: string; // Referenz statt Objekt
  createdAt: Date;
  updatedAt: Date;
} 