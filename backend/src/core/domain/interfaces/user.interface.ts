export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  favorites: string[];
  createdEvents: string[];
  artistName?: string;
  profileImage?: string;
  bio?: string;
  isArtist: boolean;
  ownedLocationIds: string[];
  createdEventIds: string[];
  likedEventIds: string[];
  likedLocationIds: string[];
  followedLocationIds: string[];
  performingEventIds: string[];
  createdAt: Date;
  updatedAt: Date;
} 