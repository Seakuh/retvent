import { IUser } from './interfaces/user.interface';
import { Event } from './event';
import { Location } from './location';

// User-Entität, die das IUser-Interface implementiert
export class User implements IUser {
  id?: string;
  email: string;
  username: string;
  password?: string;
  isArtist: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<IUser>) {
    Object.assign(this, partial);
  }
} 