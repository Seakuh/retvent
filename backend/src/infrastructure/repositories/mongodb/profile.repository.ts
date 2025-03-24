import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { IProfile } from 'src/core/domain/Profile';

@Injectable()
export class ProfileRepository {
  constructor(private readonly profileModel: Model<IProfile>) {}

  async findById(id: string): Promise<IProfile | null> {
    return this.profileModel.findById(id);
  }

  async findByUsername(username: string): Promise<IProfile | null> {
    return this.profileModel.findOne({ username });
  }

  async create(profile: IProfile): Promise<IProfile> {
    return this.profileModel.create(profile);
  }

  async update(id: string, profile: IProfile): Promise<IProfile | null> {
    return this.profileModel.findByIdAndUpdate(id, profile, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.profileModel.findByIdAndDelete(id);
    return result !== null;
  }

  async findByUserId(userId: string): Promise<IProfile | null> {
    return this.profileModel.findOne({ userId });
  }

  async findByUsernameOrEmail(
    username: string,
    email: string,
  ): Promise<IProfile | null> {
    return this.profileModel.findOne({ $or: [{ username }, { email }] });
  }

  async findByEmail(email: string): Promise<IProfile | null> {
    return this.profileModel.findOne({ email });
  }

  async updateProfilePicture(
    id: string,
    profilePictureUrl: string,
  ): Promise<IProfile | null> {
    return this.profileModel.findByIdAndUpdate(
      id,
      { profilePictureUrl },
      { new: true },
    );
  }

  async updateProfileLinks(
    id: string,
    links: string[],
  ): Promise<IProfile | null> {
    return this.profileModel.findByIdAndUpdate(id, { links }, { new: true });
  }

  async updateProfileDoorPolicy(
    id: string,
    doorPolicy: string,
  ): Promise<IProfile | null> {
    return this.profileModel.findByIdAndUpdate(
      id,
      { doorPolicy },
      { new: true },
    );
  }

  async updateProfileCategory(
    id: string,
    category: string,
  ): Promise<IProfile | null> {
    return this.profileModel.findByIdAndUpdate(id, { category }, { new: true });
  }

  async addFollower(
    profileId: string,
    followerId: string,
  ): Promise<IProfile | null> {
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
  ): Promise<IProfile | null> {
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
}
