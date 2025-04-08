export class CreateGroupDto {
  name?: string;
  eventIds?: string[];
  description?: string;
  isPublic?: boolean;
  memberIds?: string[];
}
