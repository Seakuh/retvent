import { Injectable, NotFoundException } from '@nestjs/common';
import { MongoLocationRepository } from '../../infrastructure/repositories/mongodb/location.repository';
import { MongoEventRepository } from '../../infrastructure/repositories/mongodb/event.repository';
import {
  CreateLocationDto,
  UpdateLocationDto,
} from '../../core/dto/location.dto';

@Injectable()
export class LocationService {
  constructor(
    private readonly locationRepository: MongoLocationRepository,
    private readonly eventRepository: MongoEventRepository,
  ) {}

  async findAll() {
    return this.locationRepository.findAll();
  }

  async findPopular() {
    return this.locationRepository.findPopular();
  }

  async findById(id: string) {
    return this.locationRepository.findById(id);
  }

  async createLocation(createLocationDto: CreateLocationDto, userId: string) {
    return this.locationRepository.create({
      ...createLocationDto,
      ownerId: userId,
    });
  }

  async updateLocation(
    id: string,
    updateLocationDto: UpdateLocationDto,
    userId: string,
  ) {
    const location = await this.locationRepository.findById(id);
    if (!location) {
      throw new NotFoundException('Location not found');
    }
    if (location.ownerId !== userId) {
      throw new Error('Not authorized to update this location');
    }
    return this.locationRepository.update(id, updateLocationDto);
  }

  async followLocation(locationId: string, userId: string) {
    return this.locationRepository.addFollower(locationId, userId);
  }

  async unfollowLocation(locationId: string, userId: string) {
    return this.locationRepository.removeFollower(locationId, userId);
  }

  async likeLocation(locationId: string, userId: string) {
    return this.locationRepository.addLike(locationId, userId);
  }

  async getFollowedLocationsEvents(userId: string) {
    const locations = await this.locationRepository.findByFollowerId(userId);
    const locationIds = locations.map((location) => location.id);
    return this.eventRepository.findByLocationIds(locationIds);
  }
}
