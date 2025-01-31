export interface Event {
  _id?: string;
  id: string;
  name: string;
  date: string;
  location: string;
  description: string;
  imageUrl?: string;
  category?: string;
  price?: string;
  latitude?: number;
  longitude?: number;
  uploadLatitude?: number;
  uploadLongitude?: number;
  ticketUrl?: string; // Neue Eigenschaft für Ticket-URL
}

export interface SearchParams {
  keyword?: string;
  city?: string;
  category?: string;
}

export type ViewMode = 'list' | 'map';