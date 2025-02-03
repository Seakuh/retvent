import { IUser } from './interfaces/user.interface';
import { Event } from './event';
import { Location } from './location';

export class User implements IUser {
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

  constructor(data: any) {
    this.id = data._id?.toString() || data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.favorites = data.favorites || [];
    this.createdEvents = data.createdEvents || [];
  }
} 