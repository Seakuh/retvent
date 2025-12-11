export class UserProfileDto {
  id: string;
  email: string;
  username: string;
  points: number;
  bio: string;
  profileImageUrl: string;
  headerImageUrl: string;
  links: string[];
  doorPolicy: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  achievements: string[];
  badges: string[];
  gallery: string[];
}
