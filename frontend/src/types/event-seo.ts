/**
 * Erweiterte Event-Typen für SEO & KI-Optimierung
 * Basierend auf SEO_KI_STRATEGIE.md
 */

// ========== ENUMERATIONEN ==========

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

export interface Location {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
  city?: string;
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
  ticketTypes?: TicketType[];
}

export interface TicketType {
  name: string;
  price: number;
  currency: string;
  available?: number;
  soldOut?: boolean;
}

export interface LineupMember {
  name: string;
  role?: string;
  startTime?: string;
  artistId?: string;
  artistSlug?: string;
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

export interface Review {
  userId: string;
  rating: number;        // 1-5
  text: string;
  createdAt: Date;
}

export interface UGC {
  photos?: string[];
  reviews?: Review[];
  tips?: string[];
}

// ========== ERWEITERTES EVENT-INTERFACE ==========

/**
 * Erweiterte Event-Interface für SEO & KI-Optimierung
 */
export interface EventSEO extends Event {
  // ========== SEO-FELDER ==========
  
  // URL-Struktur
  slug: string;                 // URL-freundlich (z.B. "techno-party-berlin-2024")
  citySlug: string;             // URL-freundlich (z.B. "berlin")
  
  // Beschreibungen
  shortDescription?: string;     // Meta-Description (max 160 Zeichen)
  
  // Geografische Daten
  region?: string;              // Bundesland/Region
  country: string;              // Land (z.B. "Deutschland")
  venue?: Venue;
  
  // Zeitliche Daten
  timezone: string;             // Zeitzone (z.B. "Europe/Berlin")
  
  // Kategorisierung
  categorySlug: string;         // URL-freundlich
  subcategory?: string;
  
  // ========== SEMANTISCHE FELDER FÜR KI ==========
  
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
  
  // ========== COMMUNITY-FELDER ==========
  
  likeCount: number;
  shareCount?: number;
  rsvpCount?: number;
  
  groupActivity?: GroupActivity;
  popularitySignals?: PopularitySignals;
  
  ugc?: UGC;
  
  // ========== ORGANISATOR ==========
  
  organizer?: {
    name: string;
    organizerId?: string;
    organizerSlug?: string;
    verified?: boolean;
  };
  
  // ========== COMMERZIELLE FELDER ==========
  
  price?: Price;
  
  // ========== TECHNISCHE FELDER ==========
  
  status?: "draft" | "published" | "cancelled" | "postponed";
  moderationStatus?: "pending" | "approved" | "rejected";
}

// Importiere das Basis-Event-Interface
// @ts-ignore - Event wird zur Laufzeit importiert
import type { Event } from "../utils";
