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
  
  // ========== NEUE SEO-FELDER (optional, abwärtskompatibel) ==========
  
  // URL-Struktur
  slug?: string;                 // URL-freundlich (z.B. "techno-party-berlin-2024")
  citySlug?: string;             // URL-freundlich (z.B. "berlin")
  
  // Beschreibungen
  shortDescription?: string;     // Meta-Description (max 160 Zeichen)
  
  // Geografische Daten
  region?: string;              // Bundesland/Region
  country?: string;             // Land (z.B. "Deutschland")
  venue?: {
    name: string;
    venueId?: string;
    venueSlug?: string;
    capacity?: number;
    venueType?: "club" | "open-air" | "theater" | "stadium" | "other";
  };
  
  // Zeitliche Daten
  timezone?: string;             // Zeitzone (z.B. "Europe/Berlin")
  
  // Kategorisierung
  categorySlug?: string;         // URL-freundlich
  subcategory?: string;         // Unterkategorie
  
  // ========== SEMANTISCHE FELDER FÜR KI (optional) ==========
  
  eventType?: "concert" | "festival" | "club-night" | "theater" | "sports" | "workshop" | "networking" | "exhibition" | "conference" | "party" | "comedy" | "other";
  eventFormat?: "live" | "hybrid" | "online" | "outdoor" | "indoor";
  genre?: ("techno" | "house" | "hip-hop" | "rock" | "pop" | "jazz" | "classical" | "electronic" | "indie" | "other")[];
  mood?: ("energetic" | "chill" | "romantic" | "party" | "intellectual" | "family-friendly" | "exclusive")[];
  vibe?: {
    energy: number;        // 0-100
    intimacy: number;      // 0-100 (klein vs. groß)
    exclusivity: number;   // 0-100
    social: number;        // 0-100 (sozial vs. fokussiert)
  };
  
  audience?: {
    ageRange?: [number, number];
    targetAudience?: string[];
    accessibility?: {
      wheelchairAccessible?: boolean;
      hearingImpaired?: boolean;
      visualImpaired?: boolean;
    };
  };
  
  recurrence?: {
    pattern: "single" | "daily" | "weekly" | "monthly" | "yearly" | "custom";
    interval?: number;
    endDate?: Date;
    occurrences?: number;
  };
  eventSeriesId?: string;
  eventSeries?: {
    name: string;
    slug: string;
    totalEvents?: number;
  };
  
  // Ähnliche Events (KI-generiert)
  similarEventIds?: string[];
  clusterId?: string;
  
  // ========== COMMUNITY-FELDER (optional) ==========
  
  likeCount?: number;            // Anzahl Likes (alternativ zu likeIds?.length)
  shareCount?: number;          // Anzahl Shares
  rsvpCount?: number;           // Anzahl RSVPs
  
  groupActivity?: {
    activeGroups: number;
    totalMessages?: number;
    lastActivity?: Date;
  };
  popularitySignals?: {
    trendingScore?: number;
    hotnessScore?: number;
    qualityScore?: number;
    engagementRate?: number;
  };
  
  // ========== ORGANISATOR (optional) ==========
  
  organizer?: {
    name: string;
    organizerId?: string;
    organizerSlug?: string;
    verified?: boolean;
  };
  
  // ========== COMMERZIELLE FELDER (optional) ==========
  
  priceDetails?: {
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
  };
  
  // ========== TECHNISCHE FELDER (optional) ==========
  
  status?: "draft" | "published" | "cancelled" | "postponed";
  moderationStatus?: "pending" | "approved" | "rejected";
}
