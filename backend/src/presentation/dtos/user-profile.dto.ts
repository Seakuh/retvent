export class UserProfileDto {
  id: string;
  email: string;
  username: string;
  points: string;
  bio: string;
  profileImageUrl: string;
  headerImageUrl: string;
  links: string[];
  doorPolicy: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}
