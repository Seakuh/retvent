import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Follower } from '../../../core/domain/follower';
import { IFollowerRepository } from '../../../core/repositories/follower.repository.interface';
@Injectable()
export class MongoFollowerRepository implements IFollowerRepository {
  constructor(
    @InjectModel('Follower') private followerModel: Model<Follower>,
  ) {}

  async delete(follower: Follower): Promise<boolean> {
    const result = await this.followerModel.deleteOne(follower);
    return result.deletedCount > 0;
  }
  async create(follower: Follower): Promise<Follower> {
    const created = await this.followerModel.create(follower);
    return created.toObject();
  }

  async findByFollowerId(followerId: string): Promise<Follower | null> {
    const found = await this.followerModel.findOne({ followerId });
    return found ? found.toObject() : null;
  }

  async findByFollowedId(followedId: string): Promise<Follower[]> {
    return this.followerModel.find({ followedId });
  }
}
