import { User } from '../domain/user';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Partial<User>): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  addLikedEvent(userId: string, eventId: string): Promise<User | null>;
  removeLikedEvent(userId: string, eventId: string): Promise<User | null>;
  addFollowedLocation(userId: string, locationId: string): Promise<User | null>;
  removeFollowedLocation(
    userId: string,
    locationId: string,
  ): Promise<User | null>;
  findByEmailOrUsername(email: string, username: string): Promise<User | null>;
  addFavorite(userId: any, id: string): Promise<User | null>;
  removeFavorite(userId: any, id: string): Promise<User | null>;
  getUserFavorites(id: string): Promise<string[] | undefined>;
}
