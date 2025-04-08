import { Document, model, Schema, Types } from 'mongoose';

export interface IGroup extends Document {
  name: { type: string; required: false };
  description: { type: string; required: false };
  memberIds: { type: [string]; required: false };
  creatorId: { type: Types.ObjectId; ref: 'User'; required: false };
  eventId: { type: [string]; required: false };
  isPublic: { type: boolean; required: false };
  inviteToken: { type: string; required: false };
  createdAt: { type: Date; required: false };
  updatedAt: { type: Date; required: false };
}

const GroupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: false },
    description: { type: String, required: false },
    memberIds: { type: [String], required: false },
    eventId: { type: [String], required: false },
    isPublic: { type: Boolean, required: false },
    inviteToken: { type: String, required: false },
    createdAt: { type: Date, required: false },
    updatedAt: { type: Date, required: false },
  },
  {
    timestamps: true,
    strict: true,
  },
);

export const Group = model<IGroup>('Group', GroupSchema);
