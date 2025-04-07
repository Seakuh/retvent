import { Injectable, UploadedFile } from '@nestjs/common';
import {
  Profile,
  ProfileEventDetail,
  UserPreferences,
} from 'src/core/domain/profile';
import { MongoProfileRepository } from 'src/infrastructure/repositories/mongodb/profile.repository';
import { ImageService } from 'src/infrastructure/services/image.service';
@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepository: MongoProfileRepository,
    private readonly imageService: ImageService,
  ) {}

  getAllProfiles(limit: number, offset: number): Promise<Profile[]> {
    return this.profileRepository.getAllProfiles(limit, offset);
  }
  updateProfileEmbedding(id: any, embedding: number[]) {
    return this.profileRepository.updateProfileEmbedding(id, embedding);
  }
  async updateProfileGallery(
    id: string,
    gallery: Express.Multer.File[],
  ): Promise<Profile> {
    const fileUrls = await Promise.all(
      gallery.map(async (file) => {
        const fileUrl = await this.imageService.uploadImage(file);
        return fileUrl;
      }),
    );
    return this.profileRepository.updateProfileGallery(id, fileUrls);
  }
  getProfileByUserId(userId: string): Promise<Profile> {
    return this.profileRepository.findByUserId(userId);
  }
  async getProfile(id: string): Promise<Profile> {
    return this.profileRepository.findByUserId(id);
  }

  findMissingProfileEmbeddings(BATCH_SIZE: number) {
    return this.profileRepository.findMissingProfileEmbeddings(BATCH_SIZE);
  }

  async getEventProfile(id: string): Promise<ProfileEventDetail> {
    const profile = await this.profileRepository.findByUserId(id);
    if (!profile) {
      return null;
    }
    return {
      profileImageUrl: profile.profileImageUrl,
      username: profile.username,
    };
  }

  async setProfilePreferences(
    id: string,
    preferences: UserPreferences,
  ): Promise<Profile> {
    const profile = await this.profileRepository.findByUserId(id);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Embedding für die neuen Präferenzen erstellen
    // const preferencesEmbedding =
    //   await this.eventEmbeddingService.createEmbeddingFromPreferences(
    //     preferences,
    //   );
    console.log('preferences', preferences);
    console.log('profile', profile);
    // Profil mit neuen Präferenzen und Embedding aktualisieren
    const updatedProfile =
      await this.profileRepository.updateProfilePreferences(id, preferences);
    // await this.updateProfileEmbedding(id, preferencesEmbedding);

    console.log(updatedProfile);
    return updatedProfile;
  }

  async getProfilePreferences(id: string): Promise<UserPreferences> {
    const profile = await this.profileRepository.findByUserId(id);
    return profile.preferences;
  }

  createPreferencesEmbeddings(preferences: UserPreferences): UserPreferences {
    return preferences;
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
    return this.profileRepository.addCreatedEvent(userId, eventId);
  }
}
