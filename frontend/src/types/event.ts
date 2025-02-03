export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  category: string;
  location: {
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    }
  };
}

export interface SearchParams {
  keyword?: string;
  city?: string;
  category?: string;
}

export type ViewMode = 'list' | 'map';