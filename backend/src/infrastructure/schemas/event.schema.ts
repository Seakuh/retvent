import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ 
  timestamps: true,
  strict: true,
  versionKey: false,
  toJSON: { 
    virtuals: true,
    transform: (_, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
})
export class EventDocument extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: false, default: '' })
  description?: string;

  @Prop({ required: false })
  imageUrl?: string;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ required: true })
  startTime: string;

  @Prop({ type: Date, required: false })
  endDate?: Date;

  @Prop({ required: false })
  endTime?: string;

  @Prop({ required: true })
  hostId: string;

  @Prop({ required: false })
  locationId?: string;

  @Prop({ required: false })
  category?: string;

  @Prop({ required: false, type: Number })
  price?: number;

  @Prop({ required: false })
  ticketLink?: string;

  @Prop({ 
    required: false,
    type: [{
      name: { type: String, required: true },
      role: { type: String, required: false },
      startTime: { type: String, required: false }
    }],
    default: undefined
  })
  lineup?: Array<{
    name: string;
    role?: string;
    startTime?: string;
  }>;

  @Prop({ 
    required: false,
    type: {
      instagram: { type: String, required: false },
      facebook: { type: String, required: false },
      twitter: { type: String, required: false }
    },
    default: undefined
  })
  socialMediaLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };

  @Prop({ required: false, type: [String], default: undefined })
  tags?: string[];

  @Prop({ required: false })
  website?: string;

  @Prop({ required: false, type: [String], default: [] })
  likeIds: string[];
}

const schema = SchemaFactory.createForClass(EventDocument);

// Virtuals
schema.virtual('id').get(function(this: { _id: Types.ObjectId }) {
  return this._id.toString();
});

// Indexes
schema.index({ title: 'text', description: 'text' });
schema.index({ hostId: 1 });
schema.index({ locationId: 1 });
schema.index({ category: 1 });
schema.index({ startDate: 1 });

export const EventSchema = schema; 