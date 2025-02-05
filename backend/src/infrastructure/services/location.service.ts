import { Injectable, NotFoundException } from '@nestjs/common';
import { ILocationRepository } from '../../core/repositories/location.repository.interface';
import { Location } from '../../core/domain/location';
import { CreateLocationDto } from '../../presentation/dtos/create-location.dto';
import { Inject } from '@nestjs/common';

@Injectable()
export class LocationService {
  constructor(
    @Inject('ILocationRepository')
    private readonly locationRepository: ILocationRepository
  ) {}

  async getLocationById(id: string): Promise<Location | null> {
    return this.locationRepository.findById(id);
  }

  async createLocation(createLocationDto: CreateLocationDto, userId: string): Promise<Location> {
    const locationData = {
      ...createLocationDto,
      ownerId: userId
    };
    return this.locationRepository.create(locationData);
  }

  async updateLocation(id: string, updateData: Partial<Location>, userId: string): Promise<Location> {
    const location = await this.locationRepository.findById(id);
    if (!location) {
      throw new NotFoundException('Location nicht gefunden');
    }
    if (location.ownerId !== userId) {
      throw new NotFoundException('Keine Berechtigung');
    }
    return this.locationRepository.update(id, updateData);
  }

  async followLocation(locationId: string, userId: string): Promise<Location> {
    const updated = await this.locationRepository.addFollower(locationId, userId);
    if (!updated) {
      throw new NotFoundException('Location nicht gefunden');
    }
    return updated;
  }

  async likeLocation(locationId: string, userId: string): Promise<Location> {
    const updated = await this.locationRepository.addLike(locationId, userId);
    if (!updated) {
      throw new NotFoundException('Location nicht gefunden');
    }
    return updated;
  }

  async getFollowedLocationsEvents(userId: string): Promise<Location[]> {
    // Implementierung folgt
    return [];
  }

  async findNearbyLocations(lat: number, lon: number, maxDistance: number): Promise<Location[]> {
    return this.locationRepository.findNearby(lat, lon, maxDistance);
  }

  // ... weitere Methoden
} 