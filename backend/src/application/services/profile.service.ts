import { Injectable } from '@nestjs/common';
import { IProfile } from 'src/core/domain/Profile';
import { ProfileRepository } from 'src/infrastructure/repositories/mongodb/profile.repository';
@Injectable()
export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  getProfileByUserId(userId: string): Promise<IProfile> {
    return this.profileRepository.findByUserId(userId);
  }
  async getProfile(id: string): Promise<IProfile> {
    return this.profileRepository.findById(id);
  }

  async createProfile(profile: IProfile): Promise<IProfile> {
    return this.profileRepository.create(profile);
  }

  async updateProfile(id: string, profile: IProfile): Promise<IProfile> {
    return this.profileRepository.update(id, profile);
  }

  async deleteProfile(id: string): Promise<boolean> {
    return this.profileRepository.delete(id);
  }

  async findByUserId(userId: string): Promise<IProfile | null> {
    return this.profileRepository.findByUserId(userId);
  }

  async findByUsername(username: string): Promise<IProfile | null> {
    return this.profileRepository.findByUsername(username);
  }

  async findByEmail(email: string): Promise<IProfile | null> {
    return this.profileRepository.findByEmail(email);
  }

  async findByUsernameOrEmail(
    username: string,
    email: string,
  ): Promise<IProfile | null> {
    return this.profileRepository.findByUsernameOrEmail(username, email);
  }

  async updateProfilePicture(
    id: string,
    profilePictureUrl: string,
  ): Promise<IProfile | null> {
    return this.profileRepository.updateProfilePicture(id, profilePictureUrl);
  }

  async updateProfileLinks(
    id: string,
    links: string[],
  ): Promise<IProfile | null> {
    return this.profileRepository.updateProfileLinks(id, links);
  }

  async updateProfileDoorPolicy(
    id: string,
    doorPolicy: string,
  ): Promise<IProfile | null> {
    return this.profileRepository.updateProfileDoorPolicy(id, doorPolicy);
  }

  async updateProfileCategory(
    id: string,
    category: string,
  ): Promise<IProfile | null> {
    return this.profileRepository.updateProfileCategory(id, category);
  }
}
