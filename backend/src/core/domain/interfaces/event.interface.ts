export interface IEvent {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  startDate: Date;
  startTime: string;
  hostId: string;
  isSponsored?: boolean;
  hostUsername?: string;
  locationId?: string;
  category?: string;
  price?: string;
  ticketLink?: string;
  lineup?: Array<{ name: string; role?: string; startTime?: string }>;
  socialMediaLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  tags?: string[];
  website?: string;
  likeIds?: string[];
  createdAt: Date;
  updatedAt: Date;
  email?: string;
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
  address?: {
    street?: string;
    houseNumber?: string;
    postalCode?: string;
    city?: string;
  };
  coordinates?: {
    lat?: number;
    lon?: number;
  };
  uploadLat?: number;
  uploadLon?: number;
  embedding?: number[];
  documents?: string[];
  regionId?: string;
}
