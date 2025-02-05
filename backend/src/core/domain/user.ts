import { IUser } from './interfaces/user.interface';
import { Event } from './event';
import { Location } from './location';

export class User implements IUser {
  id: string;
  username: string;
  email: string;
  password: string;
  artistName?: string;
  profileImage?: string;
  bio?: string;
  isArtist: boolean;
  
  // Beziehungen werden als Arrays von IDs gespeichert
  ownedLocationIds: string[] = [];
  createdEventIds: string[] = [];
  likedEventIds: string[] = [];
  likedLocationIds: string[] = [];
  followedLocationIds: string[] = [];
  performingEventIds: string[] = [];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<IUser>) {
    Object.assign(this, data);
  }
} 