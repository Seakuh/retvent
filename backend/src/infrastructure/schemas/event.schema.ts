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
    },
    language: { type: String },
    difficulty: { type: String },
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
