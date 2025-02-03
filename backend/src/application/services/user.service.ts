import { Injectable } from '@nestjs/common';
import { MongoUserRepository } from '../../infrastructure/repositories/mongodb/user.repository';
import { MongoLocationRepository } from '../../infrastructure/repositories/mongodb/location.repository';
import { MongoEventRepository } from '../../infrastructure/repositories/mongodb/event.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: MongoUserRepository,
    private readonly locationRepository: MongoLocationRepository,
    private readonly eventRepository: MongoEventRepository
  ) {}

  async followLocation(userId: string, locationId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    await this.userRepository.addFollowedLocation(userId, locationId);
    return { message: 'Location followed successfully' };
  }

  async unfollowLocation(userId: string, locationId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    await this.userRepository.removeFollowedLocation(userId, locationId);
    return { message: 'Location unfollowed successfully' };
  }

  async followArtist(userId: string, artistId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    await this.userRepository.addFollowedArtist(userId, artistId);
    return { message: 'Artist followed successfully' };
  }

  async unfollowArtist(userId: string, artistId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    await this.userRepository.removeFollowedArtist(userId, artistId);
    return { message: 'Artist unfollowed successfully' };
  }

  async getFollowedLocations(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    return user.followedLocationIds;
  }

  async getFollowedArtists(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    return user.followedArtistIds;
  }

  async getFollowedLocationsWithEvents(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    const locations = await this.userRepository.getFollowedLocationsWithDetails(userId);
    const locationsWithEvents = await Promise.all(
      locations.map(async (location) => {
        const upcomingEvents = await this.eventRepository.findUpcoming(location.id);
        return {
          ...location,
          upcomingEvents
        };
      })
    );

    return locationsWithEvents;
  }

  async getFollowedArtistsWithEvents(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    const artists = await this.userRepository.getFollowedArtistsWithDetails(userId);
    const artistsWithEvents = await Promise.all(
      artists.map(async (artist) => {
        const upcomingEvents = await this.eventRepository.findByArtistId(artist.id);
        return {
          ...artist,
          upcomingEvents
        };
      })
    );

    return artistsWithEvents;
  }

  async getFollowedLocationsEvents(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    const events = await this.eventRepository.findByLocationIds(user.followedLocationIds);
    return events;
  }

  async getFollowedArtistsEvents(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    const events = await this.eventRepository.findByArtistIds(user.followedArtistIds);
    return events;
  }

  async getUserDashboard(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    const [
      likedEvents,
      createdEvents,
      followedLocationsWithEvents,
      followedArtistsWithEvents
    ] = await Promise.all([
      this.eventRepository.findByIds(user.likedEventIds),
      this.eventRepository.findByIds(user.createdEventIds),
      this.getFollowedLocationsWithEvents(userId),
      this.getFollowedArtistsWithEvents(userId)
    ]);

    return {
      likedEvents,
      createdEvents,
      followedLocations: followedLocationsWithEvents,
      followedArtists: followedArtistsWithEvents
    };
  }
} 