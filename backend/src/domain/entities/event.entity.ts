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
  isSponsored?: boolean;
  socialMediaLinks?: Record<string, string>;
  tags?: string[];
  registeredUserIds?: string[];
  parentEventId?: string;
  createdAt: Date;
  updatedAt: Date;
}
