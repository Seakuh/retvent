export class CreateGroupDto {
  name?: string;
  eventIds?: string[];
  description?: string;
  creatorId?: string;
  isPublic?: boolean;
  memberIds?: string[];
}
