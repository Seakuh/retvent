// event.schema.ts
import { Schema, Document, model } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description?: string;
  imageUrl?: string;
  startDate: Date;
  startTime: string;
  hostId?: string;
  hostUsername?: string;
  locationId?: string;
  category?: string;
  price?: string | number;
  ticketLink?: string;
  lineup?: {
    name: string;
    role: string;
    startTime: string;
  }[];
  socialMediaLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  tags?: string[];
  website?: string;
  likeIds?: string[];
}

// Event Schema Definition
const EventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
  startDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  hostId: { type: String },
  hostUsername: { type: String },
  locationId: { type: String },
  category: { type: String },
  price: { type: Schema.Types.Mixed }, // String oder Number
  ticketLink: { type: String },
  lineup: [
    {
      name: { type: String, required: false },
      role: { type: String, required: false },
      startTime: { type: String, required: false }
    }
  ],
  socialMediaLinks: {
    instagram: { type: String },
    facebook: { type: String },
    twitter: { type: String }
  },
  tags: [{ type: String }],
  website: { type: String },
  likeIds: [{ type: String }]
}, {
  timestamps: true,
  strict: true
});

// Index für Performance bei Geo-Queries
EventSchema.index({ "location.coordinates": "2dsphere" });

// Pre-Hook für Debugging
EventSchema.pre('save', function(next) {
  console.log('Saving event:', this.toObject());
  next();
});

// Model Export
export const Event = model<IEvent>('Event', EventSchema);
