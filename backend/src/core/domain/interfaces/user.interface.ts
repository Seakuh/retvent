export interface IUser {
  id: string;
  username: string;
  email: string;
  password: string;
  artistName?: string;
  profileImage?: string;
  bio?: string;
  isArtist: boolean;
  createdAt: Date;
  updatedAt: Date;
} 