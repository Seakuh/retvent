export interface Event {
  _id?: string;
  id: string;
  name: string;
  title: string;
  date: string;
  location: string;
  description: string;
  imageUrl?: string;
  category?: string;
  price?: string;
  latitude?: number;
  longitude?: number;
  uploa?: number;
  uploadL?: number;
  ticketUrl?: string; // Neue Eigenschaft für Ticket-URL
}

export interface SearchParams {
  keyword?: string;
  city?: string;
  category?: string;
}

export type ViewMode = "Home" | "All" | "Filter" | "Calendar" | "Search";
