import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Feed } from '../../../core/domain/feed';
import { IFeedRepository } from '../../../core/repositories/feed.repository.interface';

@Injectable()
export class MongoFeedRepository implements IFeedRepository {
  constructor(@InjectModel('Feed') private feedModel: Model<Feed>) {}

  async create(feed: Feed): Promise<Feed> {
    return this.feedModel.create(feed);
  }

  async findByProfileId(profileId: string): Promise<Feed[]> {
    return this.feedModel.find({ profileId });
  }

  async findByEventId(eventId: string): Promise<Feed[]> {
    return this.feedModel.find({ eventId });
  }

  async findByGroupId(groupId: string): Promise<Feed[]> {
    return this.feedModel.find({ groupId });
  }

  async findByUserId(userId: string): Promise<Feed[]> {
    return this.feedModel.find({ userId });
  }
}
