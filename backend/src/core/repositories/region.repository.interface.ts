import { Region } from '../domain/region';
import { UpdateRegionDto } from 'src/presentation/dtos/update-region.dto';
import { Event } from '../domain/event';

export interface IRegionRepository {
  create(region: Partial<Region>): Promise<Region>;
  findById(id: string): Promise<Region | null>;
  findBySlug(slug: string): Promise<Region | null>;
  findAll(): Promise<Region[]>;
  update(id: string, data: UpdateRegionDto): Promise<Region | null>;
  delete(id: string): Promise<boolean>;
  findByCoordinates(lat: number, lon: number, radiusKm: number): Promise<Region[]>;
  findEventsInRegion(regionId: string): Promise<Event[]>;
  addEvent(regionId: string, eventId: string): Promise<Region | null>;
  removeEvent(regionId: string, eventId: string): Promise<Region | null>;
  addLike(regionId: string, userId: string): Promise<Region | null>;
  removeLike(regionId: string, userId: string): Promise<Region | null>;
  addFollower(regionId: string, userId: string): Promise<Region | null>;
  removeFollower(regionId: string, userId: string): Promise<Region | null>;
  incrementShareCount(regionId: string): Promise<Region | null>;
  searchRegions(query: string): Promise<Region[]>;
}
