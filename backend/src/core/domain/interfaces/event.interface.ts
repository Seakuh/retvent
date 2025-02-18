export interface IEvent {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  startDate: Date;
  startTime: string;
  hostId: string;
  locationId?: string;
  category?: string;
  price?: number;
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
} 