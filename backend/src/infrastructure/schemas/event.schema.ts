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
    city: { type: String },
    address: { type: String },
    coordinates: {
      type: {
        lat: Number,
        lng: Number
      },
      index: '2dsphere'
    }
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