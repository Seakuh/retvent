export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  likedEventIds: string[];
  createdEventIds: string[];
  followedLocationIds: string[];
  followedArtistIds: string[];
  profileImage?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
} 