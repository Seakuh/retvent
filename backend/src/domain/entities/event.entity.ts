export class Event {
  id: string;
  title: string;
  startDate: Date;
  startTime: string;
  description?: string;
  locationId?: string;
  category?: string;
  price?: string;
  endDate?: Date;
  endTime?: string;
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
  address?: {
    street?: string;
    houseNumber?: string;
    postalCode?: string;
    city?: string;
  };
}
