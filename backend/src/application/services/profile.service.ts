import { Injectable } from '@nestjs/common';
import { Profile } from 'src/core/domain/profile';
import { MongoProfileRepository } from 'src/infrastructure/repositories/mongodb/profile.repository';
@Injectable()
export class ProfileService {
  constructor(private readonly profileRepository: MongoProfileRepository) {}

  getProfileByUserId(userId: string): Promise<Profile> {
    return this.profileRepository.findByUserId(userId);
  }
  async getProfile(id: string): Promise<Profile> {
    return this.profileRepository.findById(id);
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
    profilePictureUrl: string,
  ): Promise<Profile | null> {
    return this.profileRepository.updateProfilePicture(id, profilePictureUrl);
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
}
