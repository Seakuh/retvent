import { model, Schema } from 'mongoose';

export interface IGroup {
  name: string;
  description: string;
  memberIds: string[];
  creatorId: string;
  eventIds: string[];
  isPublic: boolean;
  inviteToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: false },
    description: { type: String, required: false },
    memberIds: [{ type: String, required: false }],
    creatorId: { type: String, required: false },
    eventIds: { type: [String], required: false },
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

export interface IGroup extends Document {
  name: string;
  description: string;
  memberIds: string[];
  creatorId: string;
  eventIds: string[];
  isPublic: boolean;
  inviteToken: string;
  createdAt: Date;
  updatedAt: Date;
}

export const Group = model<IGroup>('Group', GroupSchema);
