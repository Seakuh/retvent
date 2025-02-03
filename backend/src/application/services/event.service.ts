import { Injectable } from '@nestjs/common';
import { MongoEventRepository } from '../../infrastructure/repositories/mongodb/event.repository';
import { MongoUserRepository } from '../../infrastructure/repositories/mongodb/user.repository';
import { Event } from '../../core/domain/event';
import { convertToEventData, CreateEventDto, UpdateEventDto } from '../../core/dto/event.dto';

@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: MongoEventRepository,
    private readonly userRepository: MongoUserRepository
  ) {}

  async findLatest(limit: number = 10): Promise<Event[]> {
    return this.eventRepository.findLatest(limit);
  }

  async findByCategory(category: string, limit: number = 20): Promise<Event[]> {
    return this.eventRepository.findByCategory(category, limit);
  }

  async findById(id: string): Promise<Event | null> {
    return this.eventRepository.findById(id);
  }

  async likeEvent(eventId: string, userId: string) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new Error('Event not found');

    await this.eventRepository.addLike(eventId, userId);
    await this.userRepository.addLikedEvent(userId, eventId);

    return { message: 'Event liked successfully' };
  }

  async unlikeEvent(eventId: string, userId: string) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new Error('Event not found');

    await this.eventRepository.removeLike(eventId, userId);
    await this.userRepository.removeLikedEvent(userId, eventId);

    return { message: 'Event unliked successfully' };
  }

  async getLikedEvents(userId: string): Promise<Event[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    return this.eventRepository.findByIds(user.likedEventIds);
  }

  async isLikedByUser(eventId: string, userId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) return false;
    return user.likedEventIds.includes(eventId);
  }

  async getEventsByLocation(locationId: string): Promise<Event[]> {
    return this.eventRepository.findByLocationId(locationId);
  }

  async getEventsByArtist(artistId: string): Promise<Event[]> {
    return this.eventRepository.findByArtistId(artistId);
  }

  async getUpcomingEvents(locationId: string): Promise<Event[]> {
    return this.eventRepository.findUpcoming(locationId);
  }

  async createEvent(eventData: CreateEventDto & { creatorId: string }): Promise<Event> {
    const event = await this.eventRepository.create(convertToEventData(eventData));
    await this.userRepository.addCreatedEvent(eventData.creatorId, event.id);
    return event;
  }

  async updateEvent(id: string, eventData: UpdateEventDto): Promise<Event | null> {
    return this.eventRepository.updateEvent(id, convertToEventData(eventData));
  }

  async deleteEvent(id: string): Promise<boolean> {
    return this.eventRepository.delete(id);
  }
} 