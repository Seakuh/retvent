import { Schema } from 'mongoose';

export const EventSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    startDate: { type: Date, required: true },
    startTime: { type: String, required: false },
    endDate: { type: Date, required: false },
    endTime: { type: String, required: false },
    hostId: { type: String },
    host: {
      profileImageUrl: { type: String },
      username: { type: String },
    },
    locationId: { type: String },
    locationName: { type: String },
    registeredUserIds: { type: [String], default: [] },
    registrations: { type: Number, default: 0 },
    capacity: { type: Number, default: 0 },
    validators: { type: [String], default: [] },
    isSponsored: { type: Boolean, default: false },
    address: {
      street: { type: String },
      houseNumber: { type: String },
      city: { type: String },
      postalCode: { type: String },
      country: { type: String },
      coordinates: {
        lat: { type: Number },
        lon: { type: Number },
      },
    },
    language: { type: String },
    difficulty: { type: String },
    postalCode: { type: String },
    country: { type: String },
    coordinates: {
      lat: { type: Number },
      lon: { type: Number },
    },
    remoteUrl: { type: String },
    category: { type: String },
    price: Schema.Types.Mixed,
    ticketLink: { type: String },
    lineupPictureUrl: { type: [String] },
    videoUrls: { type: [String] },
    documents: { type: [String] },
    lineup: [
      new Schema({
        name: { type: String },
        role: { type: String },
        startTime: { type: String },
        endTime: { type: String },
        profileId: {
          type: Schema.Types.ObjectId,
          ref: 'Profile',
          required: false,
        },
      }),
    ],
    email: { type: String },
    uploadLat: { type: Number },
    uploadLon: { type: Number },
    socialMediaLinks: {
      instagram: { type: String },
      facebook: { type: String },
      twitter: { type: String },
    },
    tags: [{ type: String }],
    views: { type: Number, default: 0 },
    website: { type: String },
    likeIds: [{ type: String }],
    city: { type: String },
    parentEventId: { type: Schema.Types.ObjectId, ref: 'Event', default: null },
    commentsEnabled: { type: Boolean, default: true }, // Comments enabled by default
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: false,
        default: undefined, // Damit bleibt es komplett optional
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: false,
        default: undefined,
      },
      city: {
        type: String,
        required: false,
        default: undefined,
      },
      formattedAddress: {
        type: String,
        required: false,
        default: undefined,
      },
    },
    embedding: { type: [Number], default: undefined },
    // ========== SEO-FELDER ==========
    slug: { type: String },
    citySlug: { type: String },
    shortDescription: { type: String },
    region: { type: String },
    regionId: { type: String, index: true }, // Referenz zur Region-Collection
    timezone: { type: String },
    categorySlug: { type: String },
    subcategory: { type: String },
    // Venue-Informationen
    venue: {
      name: { type: String },
      venueId: { type: String },
      venueSlug: { type: String },
      capacity: { type: Number },
      venueType: {
        type: String,
        enum: ['club', 'open-air', 'theater', 'stadium', 'other'],
      },
    },
    // ========== SEMANTISCHE FELDER FÜR KI ==========
    eventType: {
      type: String,
      enum: [
        'concert',
        'festival',
        'club-night',
        'theater',
        'sports',
        'workshop',
        'networking',
        'exhibition',
        'conference',
        'party',
        'comedy',
        'other',
      ],
    },
    eventFormat: {
      type: String,
      enum: ['live', 'hybrid', 'online', 'outdoor', 'indoor'],
    },
    genre: [{ type: String }],
    mood: [{ type: String }],
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
      pattern: {
        type: String,
        enum: ['single', 'daily', 'weekly', 'monthly', 'yearly', 'custom'],
      },
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
    // ========== COMMUNITY-FELDER ==========
    likeCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    rsvpCount: { type: Number, default: 0 },
    groupActivity: {
      activeGroups: { type: Number, default: 0 },
      totalMessages: { type: Number, default: 0 },
      lastActivity: { type: Date },
    },
    popularitySignals: {
      trendingScore: { type: Number },
      hotnessScore: { type: Number },
      qualityScore: { type: Number },
      engagementRate: { type: Number },
    },
    // ========== ORGANISATOR ==========
    organizer: {
      name: { type: String },
      organizerId: { type: String },
      organizerSlug: { type: String },
      verified: { type: Boolean, default: false },
    },
    // ========== COMMERZIELLE FELDER ==========
    priceDetails: {
      amount: { type: Number },
      currency: { type: String },
      priceRange: {
        type: String,
        enum: ['free', 'low', 'medium', 'high', 'premium'],
      },
      ticketTypes: [
        {
          name: { type: String },
          price: { type: Number },
          currency: { type: String },
          available: { type: Number },
          soldOut: { type: Boolean },
        },
      ],
    },
    // ========== TECHNISCHE FELDER ==========
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'postponed', 'pending'],
      default: 'published',
    },
    moderationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
    },
    scheduledReleaseDate: {
      type: Date, // Geplantes Release-Datum für automatische Veröffentlichung
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

EventSchema.pre('save', function (next) {
  next();
});

EventSchema.index({ 'lineup.name': 1 });
// Create indexes
EventSchema.index({ 'location.city': 1 });
EventSchema.index({ title: 'text', description: 'text' });

// Add a 2dsphere index for geospatial queries
EventSchema.index({ 'location.coordinates': '2dsphere' });

// ========== SEO INDEXES ==========
EventSchema.index({ slug: 1 });
EventSchema.index({ citySlug: 1 });
EventSchema.index({ categorySlug: 1 });
EventSchema.index({ eventType: 1 });
EventSchema.index({ genre: 1 });
EventSchema.index({ status: 1, startDate: 1 }); // Für Sitemap-Query
EventSchema.index({ status: 1, scheduledReleaseDate: 1 }); // Für Published-Events Filter (Performance)
EventSchema.index({ clusterId: 1 });
EventSchema.index({ eventSeriesId: 1 });
