import { model, Schema } from 'mongoose';

export interface IGroup extends Document {
  name?: string;
  description?: string;
  memberIds?: string[];
  creatorId: string;
  eventId?: string;
  imageUrl?: string;
  isPublic?: boolean;
  inviteToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const GroupSchema = new Schema<IGroup>(
  {
    name: { type: String },
    description: { type: String },
    memberIds: [{ type: String }],
    creatorId: { type: String, required: true },
    eventId: { type: String },
    imageUrl: { type: String },
    isPublic: { type: Boolean },
    inviteToken: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    strict: true,
  },
);

GroupSchema.pre('save', function (next) {
  console.log('Saving group:', this.toObject());
  next();
});

export const Group = model<IGroup>('Group', GroupSchema);
