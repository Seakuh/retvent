export class UpdateCommunityDto {
  communityId: string;
  name?: string;
  description?: string;
  codeOfConduct?: string;
  isPublic?: boolean;
  imageUrl?: string;
}
