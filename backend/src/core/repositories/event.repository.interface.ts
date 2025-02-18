import { Event } from '../domain/event';

export interface IEventRepository {
  findById(id: string): Promise<Event | null>;
  findByLocationId(locationId: string): Promise<Event[]>;
  findByOrganizerId(organizerId: string): Promise<Event[]>;
  create(event: Partial<Event>): Promise<Event>;
  update(id: string, event: Partial<Event>): Promise<Event | null>;
  delete(id: string): Promise<boolean>;
  findUpcoming(locationId: string): Promise<Event[]>;
  addLike(eventId: string, userId: string): Promise<Event | null>;
  removeLike(eventId: string, userId: string): Promise<Event | null>;
  addArtist(eventId: string, artistId: string): Promise<Event | null>;
  removeArtist(eventId: string, artistId: string): Promise<Event | null>;
  updateEvent(id: string, eventData: Partial<Event>): Promise<Event | null>;
  findByHostId(hostId: string): Promise<Event[]>;
} 