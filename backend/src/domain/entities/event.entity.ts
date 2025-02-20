export class Event {
  id: string;
  title: string;
  startDate: Date;
  startTime: string;
  description?: string;
  locationId?: string;
  category?: string;
  price?: string;
  hostUsername: string;
  ticketLink?: string;
  imageUrl?: string;
  lineup?: any[];
  socialMediaLinks?: Record<string, string>;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
} 