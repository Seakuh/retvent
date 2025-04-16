import { Location } from '../domain/location';

export interface ILocationRepository {
  findById(id: string): Promise<Location | null>;
  findByOwnerId(ownerId: string): Promise<Location[]>;
  create(location: Partial<Location>): Promise<Location>;
  update(id: string, location: Partial<Location>): Promise<Location | null>;
  delete(id: string): Promise<boolean>;
  findNearby(
    lat: number,
    lon: number,
    maxDistance: number,
  ): Promise<Location[]>;
  addFollower(locationId: string, userId: string): Promise<Location | null>;
  removeFollower(locationId: string, userId: string): Promise<Location | null>;
  addLike(locationId: string, userId: string): Promise<Location | null>;
  removeLike(locationId: string, userId: string): Promise<Location | null>;
}
