export interface Event {
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
}

export interface SearchParams {
  keyword?: string;
  city?: string;
  category?: string;
}

export type ViewMode = 'list' | 'map';