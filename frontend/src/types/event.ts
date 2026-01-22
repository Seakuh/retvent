// SEO & KI-Optimierung: Event-Typen
export type EventType = 
  | "concert" 
  | "festival" 
  | "club-night" 
  | "theater" 
  | "sports" 
  | "workshop" 
  | "networking" 
  | "exhibition"
  | "conference" 
  | "party" 
  | "comedy" 
  | "other";

export type EventFormat = 
  | "live" 
  | "hybrid" 
  | "online" 
  | "outdoor" 
  | "indoor";

export type Genre = 
  | "techno" 
  | "house" 
  | "hip-hop" 
  | "rock" 
  | "pop" 
  | "jazz" 
  | "classical" 
  | "electronic" 
  | "indie" 
  | "other";

export type Mood = 
  | "energetic" 
  | "chill" 
  | "romantic" 
  | "party" 
  | "intellectual" 
  | "family-friendly" 
  | "exclusive";

export interface Vibe {
  energy: number;        // 0-100
  intimacy: number;      // 0-100 (klein vs. groß)
  exclusivity: number;   // 0-100
  social: number;        // 0-100 (sozial vs. fokussiert)
}

export interface Address {
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  city: string;
  country: string;
}

export interface Venue {
  name: string;
  venueId?: string;
  venueSlug?: string;
  capacity?: number;
  venueType?: "club" | "open-air" | "theater" | "stadium" | "other";
}

export interface Audience {
  ageRange?: [number, number];
  targetAudience?: string[];
  accessibility?: {
    wheelchairAccessible?: boolean;
    hearingImpaired?: boolean;
    visualImpaired?: boolean;
  };
}

export interface Recurrence {
  pattern: "single" | "daily" | "weekly" | "monthly" | "yearly" | "custom";
  interval?: number;
  endDate?: Date;
  occurrences?: number;
}

export interface EventSeries {
  name: string;
  slug: string;
  totalEvents?: number;
}

export interface Price {
  amount?: number;
  currency?: string;
  priceRange?: "free" | "low" | "medium" | "high" | "premium";
  ticketTypes?: Array<{
    name: string;
    price: number;
    currency: string;
    available?: number;
    soldOut?: boolean;
  }>;
}

export interface GroupActivity {
  activeGroups: number;
  totalMessages?: number;
  lastActivity?: Date;
}

export interface PopularitySignals {
  trendingScore?: number;
  hotnessScore?: number;
  qualityScore?: number;
  engagementRate?: number;
}

export interface Event {
  // ========== BESTEHENDE FELDER (unverändert) ==========
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

  // ========== NEUE SEO-FELDER (optional, abwärtskompatibel) ==========
  
  // URL-Struktur
  slug?: string;                 // URL-freundlich (z.B. "techno-party-berlin-2024")
  citySlug?: string;             // URL-freundlich (z.B. "berlin")
  
  // Beschreibungen
  shortDescription?: string;     // Meta-Description (max 160 Zeichen)
  
  // Geografische Daten
  region?: string;              // Bundesland/Region
  country?: string;             // Land (z.B. "Deutschland")
  address?: Address;            // Strukturierte Adresse
  venue?: Venue;                 // Venue-Informationen
  
  // Zeitliche Daten
  startDate?: Date | string;     // Bereits vorhanden in utils.ts, hier für Konsistenz
  startTime?: string;            // Bereits vorhanden in utils.ts
  endDate?: Date | string;       // Bereits vorhanden in utils.ts
  endTime?: string;              // Bereits vorhanden in utils.ts
  timezone?: string;             // Zeitzone (z.B. "Europe/Berlin")
  
  // Kategorisierung
  categorySlug?: string;         // URL-freundlich
  subcategory?: string;         // Unterkategorie
  
  // ========== SEMANTISCHE FELDER FÜR KI (optional) ==========
  
  eventType?: EventType;
  eventFormat?: EventFormat;
  genre?: Genre[];
  mood?: Mood[];
  vibe?: Vibe;
  
  audience?: Audience;
  
  recurrence?: Recurrence;
  eventSeriesId?: string;
  eventSeries?: EventSeries;
  
  // Ähnliche Events (KI-generiert)
  similarEventIds?: string[];
  clusterId?: string;
  
  // ========== COMMUNITY-FELDER (optional) ==========
  
  likeCount?: number;            // Anzahl Likes (alternativ zu likeIds?.length)
  shareCount?: number;          // Anzahl Shares
  rsvpCount?: number;           // Anzahl RSVPs
  
  groupActivity?: GroupActivity;
  popularitySignals?: PopularitySignals;
  
  // ========== ORGANISATOR (optional) ==========
  
  organizer?: {
    name: string;
    organizerId?: string;
    organizerSlug?: string;
    verified?: boolean;
  };
  
  // ========== COMMERZIELLE FELDER (optional) ==========
  
  priceDetails?: Price;         // Strukturierte Preisinformationen (alternativ zu price string)
  
  // ========== TECHNISCHE FELDER (optional) ==========
  
  status?: "draft" | "published" | "cancelled" | "postponed";
  moderationStatus?: "pending" | "approved" | "rejected";
}

export interface SearchParams {
  keyword?: string;
  city?: string;
  category?: string;
}

export type ViewMode =
  | "Home"
  | "All"
  | "Filter"
  | "Calendar"
  | "Search"
  | "Trending"
  | "Now";
