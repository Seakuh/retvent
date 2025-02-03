import { User } from '../domain/user';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(userData: Partial<User>): Promise<User>;
  update(id: string, userData: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  addLikedEvent(userId: string, eventId: string): Promise<void>;
  removeLikedEvent(userId: string, eventId: string): Promise<void>;
  addFollowedLocation(userId: string, locationId: string): Promise<void>;
  removeFollowedLocation(userId: string, locationId: string): Promise<void>;
  addFollowedArtist(userId: string, artistId: string): Promise<void>;
  removeFollowedArtist(userId: string, artistId: string): Promise<void>;
  addCreatedEvent(userId: string, eventId: string): Promise<void>;
} 