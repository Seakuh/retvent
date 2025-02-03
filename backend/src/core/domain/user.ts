import { IUser } from './interfaces/user.interface';
import { Event } from './event';
import { Location } from './location';

export class User implements IUser {
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

  constructor(data: any) {
    this.id = data._id?.toString() || data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.likedEventIds = data.likedEventIds || [];
    this.createdEventIds = data.createdEventIds || [];
    this.followedLocationIds = data.followedLocationIds || [];
    this.followedArtistIds = data.followedArtistIds || [];
    this.profileImage = data.profileImage;
    this.bio = data.bio;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
} 