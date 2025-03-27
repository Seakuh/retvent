import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile } from '../../../core/domain/profile';
import { IProfileRepository } from '../../../core/repositories/profile.repository.interface';

@Injectable()
export class MongoProfileRepository implements IProfileRepository {
  constructor(
    @InjectModel('Profile') private readonly profileModel: Model<Profile>,
  ) {}
  findBySlug(slug: string): Promise<Profile | null> {
    throw new Error('Method not implemented.');
  }
  findByHostId(hostId: string): Promise<Event[]> {
    throw new Error('Method not implemented.');
  }

  async findById(id: string): Promise<Profile | null> {
    // when no points are set, set them to 0
    console.log('findById - id:', id);
    const profile = await this.profileModel.findById(id);
    if (profile && !profile.get('points')) {
      profile.set('points', 0);
      await profile.save();
    }
    return profile;
  }

  async findByUsername(username: string): Promise<Profile | null> {
    return this.profileModel.findOne({ username });
  }

  async create(profile: Profile): Promise<Profile> {
    return this.profileModel.create(profile);
  }

  async update(id: string, profile: Profile): Promise<Profile | null> {
    return this.profileModel.findByIdAndUpdate(id, profile, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.profileModel.findByIdAndDelete(id);
    return result !== null;
  }

  async findByUserId(userId: string): Promise<Profile | null> {
    return this.profileModel.findOne({ userId });
  }

  async findByUsernameOrEmail(
    username: string,
    email: string,
  ): Promise<Profile | null> {
    return this.profileModel.findOne({ $or: [{ username }, { email }] });
  }

  async findByEmail(email: string): Promise<Profile | null> {
    return this.profileModel.findOne({ email });
  }

  async updateProfilePicture(
    userId: string,
    profileImageUrl: string,
  ): Promise<Profile | null> {
    return this.profileModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          profileImageUrl: profileImageUrl || null,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );
  }

  async updateHeaderPicture(
    userId: string,
    headerImageUrl: string,
  ): Promise<Profile | null> {
    return this.profileModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          headerImageUrl: headerImageUrl || null,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );
  }

  async updateProfileLinks(
    id: string,
    links: string[],
  ): Promise<Profile | null> {
    return this.profileModel.findByIdAndUpdate(id, { links }, { new: true });
  }

  async updateProfileDoorPolicy(
    id: string,
    doorPolicy: string,
  ): Promise<Profile | null> {
    return this.profileModel.findByIdAndUpdate(
      id,
      { doorPolicy },
      { new: true },
    );
  }

  async updateProfileCategory(
    id: string,
    category: string,
  ): Promise<Profile | null> {
    return this.profileModel.findByIdAndUpdate(id, { category }, { new: true });
  }

  async addFollower(
    profileId: string,
    followerId: string,
  ): Promise<Profile | null> {
    return this.profileModel.findByIdAndUpdate(
      profileId,
      {
        $addToSet: { followers: followerId },
        $inc: { followerCount: 1 }, // Erhöht den Counter automatisch
      },
      { new: true },
    );
  }

  async removeFollower(
    profileId: string,
    followerId: string,
  ): Promise<Profile | null> {
    return this.profileModel.findByIdAndUpdate(
      profileId,
      {
        $pull: { followers: followerId },
        $inc: { followerCount: -1 }, // Verringert den Counter automatisch
      },
      { new: true },
    );
  }

  async getFollowerCount(profileId: string): Promise<number> {
    const profile = await this.profileModel
      .findById(profileId)
      .select('followerCount');
    return profile?.followerCount || 0;
  }

  async addCreatedEvent(
    userId: string,
    eventId: string,
  ): Promise<Profile | null> {
    return this.profileModel.findByIdAndUpdate(
      userId,
      { $push: { createdEventIds: eventId } },
      { new: true },
    );
  }
}
