import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Feed } from '../../../core/domain/feed';
import { IFeedRepository } from '../../../core/repositories/feed.repository.interface';

@Injectable()
export class MongoFeedRepository implements IFeedRepository {
  constructor(@InjectModel('Feed') private feedModel: Model<Feed>) {}

  async create(feed: Feed): Promise<Feed> {
    console.log('#######################Feed created:', feed);
    const newFeed = await this.feedModel.create(feed);
    console.log('#######################New feed:', newFeed);
    return newFeed;
  }

  async findByProfileId(profileId: string): Promise<Feed[]> {
    return this.feedModel.find({ profileId }).sort({ createdAt: -1 });
  }

  async findByEventId(eventId: string): Promise<Feed[]> {
    return this.feedModel.find({ eventId }).sort({ createdAt: -1 });
  }

  async findByGroupId(groupId: string): Promise<Feed[]> {
    return this.feedModel.find({ groupId }).sort({ createdAt: -1 });
  }

  async findByUserId(userId: string): Promise<Feed[]> {
    return this.feedModel.find({ userId }).sort({ createdAt: -1 });
  }

  async findAll(): Promise<Feed[]> {
    return this.feedModel.find().sort({ createdAt: -1 });
  }
}
