export interface Event {
  id: string;
  name: string;
  date: string;
  description: string;
  location: string;
  imageUrl?: string;
  category?: string;
  price?: string;
}

export interface SearchParams {
  keyword?: string;
  city?: string;
  category?: string;
}

export type ViewMode = 'list' | 'map';