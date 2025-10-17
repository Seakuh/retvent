export class Community {
  id: string;
  name: string;
  description?: string;
  codeOfConduct?: string;
  creatorId: string;
  isPublic: boolean;
  imageUrl?: string;
  moderators: string[];
  members: string[];
  admins: string[];
  bannedUsers: string[];
  eventIds: string[];
  createdAt: Date;
  updatedAt: Date;
}
