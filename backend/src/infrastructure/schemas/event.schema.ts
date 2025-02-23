import { Schema } from 'mongoose';

export const EventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
  startDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  hostId: { type: String },
  hostUsername: { type: String },
  locationId: { type: String },
  category: { type: String },
  price: Schema.Types.Mixed,
  ticketLink: { type: String },
  lineup: [new Schema({
    name: { type: String },
    role: { type: String },
    startTime: { type: String }
  })],
  socialMediaLinks: {
    instagram: { type: String },
    facebook: { type: String },
    twitter: { type: String }
  },
  tags: [{ type: String }],
  website: { type: String },
  likeIds: [{ type: String }],
  city: { type: String },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    city: String,
    formattedAddress: String
  }
}, {
  timestamps: true,
  strict: true
});

EventSchema.pre('save', function(next) {
  console.log('Saving event:', this.toObject());
  next();
});

// Create indexes
EventSchema.index({ 'location.city': 1 });
EventSchema.index({ title: 'text', description: 'text' });

// Add a 2dsphere index for geospatial queries
EventSchema.index({ 'location.coordinates': '2dsphere' }); 