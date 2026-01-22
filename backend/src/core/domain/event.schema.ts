// event.schema.ts
import { Document, model, Schema } from 'mongoose';

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
  | "Trending";

export interface IEvent extends Document {
  title: string;
  description?: string;
  imageUrl?: string;
  startDate: Date;
  startTime: string;
  endDate: Date;
  endTime: string;
  hostId?: string;
  host?: {
    profileImageUrl: string;
    username: string;
  };
  locationId?: string;
  category?: string;
  price?: string | number;
  address?: {
    street?: string;
    houseNumber?: string;
    postalCode?: string;
    city?: string;
  };
  communityId?: string;
  isSponsored?: boolean;
  ticketLink?: string;
  lineup?: {
    name: string;
    role: string;
    startTime: string;
    endTime: string;
    userId?: string;
  }[];
  isPrivate?: boolean;
  socialMediaLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  tags?: string[];
  capacity?: number;
  language?: string;
  difficulty?: string;
  registrations?: number;
  remoteUrl?: string;
  registeredUserIds?: string[];
  website?: string;
  likeIds?: string[];
  validators?: string[]; // User IDs who can scan tickets at event entrance
  parentEventId?: string;
  commentsEnabled?: boolean; // Whether comments are enabled for this event
  location?: {
    city?: string;
    address?: string;
    coordinates?: {
      lat?: number;
      lon?: number;
    };
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
  venue?: Venue;                 // Venue-Informationen
  
  // Zeitliche Daten
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
  scheduledReleaseDate?: Date; // Geplantes Release-Datum für automatische Veröffentlichung
}

// Event Schema Definition
const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    communityId: { type: String },
    startDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    registeredUserIds: { type: [String], default: [] },
    hostId: { type: String },
    host: {
      profileImageUrl: { type: String },
      username: { type: String },
    },
    locationId: { type: String },
    category: { type: String },
    price: { type: Schema.Types.Mixed }, // String oder Number
    ticketLink: { type: String },
    lineup: [
      {
        name: { type: String, required: false },
        role: { type: String, required: false },
        userId: { type: String, required: false },
        startTime: { type: String, required: false },
        endTime: { type: String, required: false },
      },
    ],
    isPrivate: { type: Boolean, default: false },
    socialMediaLinks: {
      instagram: { type: String },
      facebook: { type: String },
      twitter: { type: String },
    },
    tags: [{ type: String }],
    website: { type: String },
    likeIds: [{ type: String }],
    validators: [{ type: String }], // User IDs who can scan tickets
    parentEventId: { type: String, ref: 'Event', default: null },
    commentsEnabled: { type: Boolean, default: true }, // Comments enabled by default
    
    // ========== NEUE SEO-FELDER (optional, abwärtskompatibel) ==========
    
    // URL-Struktur
    slug: { type: String },
    citySlug: { type: String },
    
    // Beschreibungen
    shortDescription: { type: String },
    
    // Geografische Daten
    region: { type: String },
    country: { type: String },
    venue: {
      name: { type: String },
      venueId: { type: String },
      venueSlug: { type: String },
      capacity: { type: Number },
      venueType: { type: String, enum: ['club', 'open-air', 'theater', 'stadium', 'other'] },
    },
    
    // Zeitliche Daten
    timezone: { type: String },
    
    // Kategorisierung
    categorySlug: { type: String },
    subcategory: { type: String },
    
    // ========== SEMANTISCHE FELDER FÜR KI (optional) ==========
    
    eventType: { type: String, enum: ['concert', 'festival', 'club-night', 'theater', 'sports', 'workshop', 'networking', 'exhibition', 'conference', 'party', 'comedy', 'other'] },
    eventFormat: { type: String, enum: ['live', 'hybrid', 'online', 'outdoor', 'indoor'] },
    genre: [{ type: String, enum: ['techno', 'house', 'hip-hop', 'rock', 'pop', 'jazz', 'classical', 'electronic', 'indie', 'other'] }],
    mood: [{ type: String, enum: ['energetic', 'chill', 'romantic', 'party', 'intellectual', 'family-friendly', 'exclusive'] }],
    vibe: {
      energy: { type: Number, min: 0, max: 100 },
      intimacy: { type: Number, min: 0, max: 100 },
      exclusivity: { type: Number, min: 0, max: 100 },
      social: { type: Number, min: 0, max: 100 },
    },
    
    audience: {
      ageRange: [{ type: Number }],
      targetAudience: [{ type: String }],
      accessibility: {
        wheelchairAccessible: { type: Boolean },
        hearingImpaired: { type: Boolean },
        visualImpaired: { type: Boolean },
      },
    },
    
    recurrence: {
      pattern: { type: String, enum: ['single', 'daily', 'weekly', 'monthly', 'yearly', 'custom'] },
      interval: { type: Number },
      endDate: { type: Date },
      occurrences: { type: Number },
    },
    eventSeriesId: { type: String },
    eventSeries: {
      name: { type: String },
      slug: { type: String },
      totalEvents: { type: Number },
    },
    
    // Ähnliche Events (KI-generiert)
    similarEventIds: [{ type: String }],
    clusterId: { type: String },
    
    // ========== COMMUNITY-FELDER (optional) ==========
    
    likeCount: { type: Number },
    shareCount: { type: Number },
    rsvpCount: { type: Number },
    
    groupActivity: {
      activeGroups: { type: Number },
      totalMessages: { type: Number },
      lastActivity: { type: Date },
    },
    popularitySignals: {
      trendingScore: { type: Number },
      hotnessScore: { type: Number },
      qualityScore: { type: Number },
      engagementRate: { type: Number },
    },
    
    // ========== ORGANISATOR (optional) ==========
    
    organizer: {
      name: { type: String },
      organizerId: { type: String },
      organizerSlug: { type: String },
      verified: { type: Boolean },
    },
    
    // ========== COMMERZIELLE FELDER (optional) ==========
    
    priceDetails: {
      amount: { type: Number },
      currency: { type: String },
      priceRange: { type: String, enum: ['free', 'low', 'medium', 'high', 'premium'] },
      ticketTypes: [{
        name: { type: String },
        price: { type: Number },
        currency: { type: String },
        available: { type: Number },
        soldOut: { type: Boolean },
      }],
    },
    
    // ========== TECHNISCHE FELDER (optional) ==========
    
    status: { type: String, enum: ['draft', 'published', 'cancelled', 'postponed'] },
    moderationStatus: { type: String, enum: ['pending', 'approved', 'rejected'] },
    scheduledReleaseDate: { type: Date }, // Geplantes Release-Datum für automatische Veröffentlichung
  },
  {
    timestamps: true,
    strict: true,
  },
);

EventSchema.index({ 'lineup.userId': 1 });

// Index für Performance bei Geo-Queries
EventSchema.index({ 'location.coordinates': '2dsphere' });

// Pre-Hook für Debugging
EventSchema.pre('save', function (next) {
  next();
});

// Model Export
export const Event = model<IEvent>('Event', EventSchema);
