import { Schema, model } from 'mongoose';

interface IFollower {
  followerId: string;
  followedId: string;
  createdAt: Date;
  // Einfach erweiterbar um:
  notificationPreferences?: {
    email: boolean;
    push: boolean;
  };
  lastInteraction?: Date;
  notes?: string;
  // ... weitere Metadaten
}

const FollowerSchema = new Schema<IFollower>({
  followerId: { type: String, required: true },
  followedId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Follower = model<IFollower>('Follower', FollowerSchema);
