export class CreateCommunityDto {
  name: string;
  description?: string;
  codeOfConduct?: string;
  creatorId?: string;
  isPublic?: boolean;
  imageUrl?: string;
}
