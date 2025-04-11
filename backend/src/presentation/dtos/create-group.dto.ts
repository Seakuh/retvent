export class CreateGroupDto {
  name?: string;
  eventId?: string;
  description?: string;
  creatorId?: string;
  isPublic?: boolean;
  imageUrl?: string;
  memberIds?: string[];
}
