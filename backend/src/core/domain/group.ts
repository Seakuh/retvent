export class Group {
  id?: string;
  name?: string;
  description?: string;
  memberIds: string[];
  creatorId: string;
  eventId?: string;
  imageUrl?: string;
  inviteToken?: string;
  isPublic?: boolean;
  isPrivate?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
