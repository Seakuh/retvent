import { Injectable, UploadedFile } from '@nestjs/common';
import { Profile } from 'src/core/domain/profile';
import { MongoProfileRepository } from 'src/infrastructure/repositories/mongodb/profile.repository';
import { ImageService } from 'src/infrastructure/services/image.service';
@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepository: MongoProfileRepository,
    private readonly imageService: ImageService,
  ) {}

  getProfileByUserId(userId: string): Promise<Profile> {
    return this.profileRepository.findByUserId(userId);
  }
  async getProfile(id: string): Promise<Profile> {
    return this.profileRepository.findByUserId(id);
  }

  async createProfile(profile: Profile): Promise<Profile> {
    return this.profileRepository.create(profile);
  }

  async updateProfile(id: string, profile: Profile): Promise<Profile> {
    return this.profileRepository.update(id, profile);
  }

  async deleteProfile(id: string): Promise<boolean> {
    return this.profileRepository.delete(id);
  }

  async findByUserId(userId: string): Promise<Profile | null> {
    return this.profileRepository.findByUserId(userId);
  }

  async findByUsername(username: string): Promise<Profile | null> {
    return this.profileRepository.findByUsername(username);
  }

  async findByEmail(email: string): Promise<Profile | null> {
    return this.profileRepository.findByEmail(email);
  }

  async findByUsernameOrEmail(
    username: string,
    email: string,
  ): Promise<Profile | null> {
    return this.profileRepository.findByUsernameOrEmail(username, email);
  }

  async updateProfilePicture(
    id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Profile | null> {
    try {
      const fileUrl = await this.imageService.uploadImage(file);
      return this.profileRepository.updateProfilePicture(id, fileUrl);
    } catch (error) {
      console.error('Error updating profile picture:', error);
      throw new Error('Error updating profile picture');
    }
  }

  async updateHeaderPicture(
    id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Profile | null> {
    try {
      const fileUrl = await this.imageService.uploadImage(file);
      return this.profileRepository.updateHeaderPicture(id, fileUrl);
    } catch (error) {
      console.error('Error updating header picture:', error);
      throw new Error('Error updating header picture');
    }
  }

  async updateProfileLinks(
    id: string,
    links: string[],
  ): Promise<Profile | null> {
    return this.profileRepository.updateProfileLinks(id, links);
  }

  async updateProfileDoorPolicy(
    id: string,
    doorPolicy: string,
  ): Promise<Profile | null> {
    return this.profileRepository.updateProfileDoorPolicy(id, doorPolicy);
  }

  async updateProfileCategory(
    id: string,
    category: string,
  ): Promise<Profile | null> {
    return this.profileRepository.updateProfileCategory(id, category);
  }

  async addCreatedEvent(
    userId: string,
    eventId: string,
  ): Promise<Profile | null> {
    console.log('addCreatedEvent - userId:', userId);
    console.log('addCreatedEvent - eventId:', eventId);
    console.log('addCreatedEvent - profileRepository:', this.profileRepository);
    return this.profileRepository.addCreatedEvent(userId, eventId);
  }
}
