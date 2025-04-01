export interface IEvent {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  startDate: Date;
  startTime: string;
  hostId: string;
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
  location?: {
    city?: string;
    address?: string;
    coordinates?: {
      lat?: number;
      lon?: number;
    };
  };
  embedding?: number[];
}
