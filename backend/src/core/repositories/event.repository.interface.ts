import { Event } from '../domain/event';

export interface IEventRepository {
  findById(id: string): Promise<Event | null>;
  findByIds(ids: string[]): Promise<Event[]>;
  findByLocationId(locationId: string): Promise<Event[]>;
  findByLocationIds(locationIds: string[]): Promise<Event[]>;
  findByArtistId(artistId: string): Promise<Event[]>;
  findByArtistIds(artistIds: string[]): Promise<Event[]>;
  findByOrganizerId(organizerId: string): Promise<Event[]>;
  create(event: Partial<Event>): Promise<Event>;
  update(id: string, event: Partial<Event>): Promise<Event | null>;
  delete(id: string): Promise<boolean>;
  findUpcoming(locationId: string): Promise<Event[]>;
  addLike(eventId: string, userId: string): Promise<void>;
  removeLike(eventId: string, userId: string): Promise<void>;
  addArtist(eventId: string, artistId: string): Promise<Event | null>;
  removeArtist(eventId: string, artistId: string): Promise<Event | null>;
  updateEvent(id: string, eventData: Partial<Event>): Promise<Event | null>;
  isLikedByUser(eventId: string, userId: string): Promise<boolean>;
} 