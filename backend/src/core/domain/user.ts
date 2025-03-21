import { Event } from './event';
import { IUser } from './interfaces/user.interface';

// User-Entität, die das IUser-Interface implementiert
export class User implements IUser {
  id?: string;
  email: string;
  username: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
  events?: Event[];

  constructor(partial: Partial<IUser>) {
    Object.assign(this, partial);
  }
}
