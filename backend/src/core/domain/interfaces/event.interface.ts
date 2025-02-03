export interface IEvent {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  startDate: Date;
  startTime: string;
  endDate?: Date;
  endTime?: string;
  organizerId: string; // Referenz statt Objekt
  locationId: string; // Referenz statt Objekt
  artistIds: string[]; // Referenzen statt Objekte
  createdAt: Date;
  updatedAt: Date;
} 