export interface IGroup {
  name?: string;
  description?: string;
  memberIds?: string[];
  creatorId?: string;
  eventId?: string[];
  isPublic?: boolean;
  inviteToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
