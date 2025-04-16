import { Injectable } from '@nestjs/common';
import { Event, Feed } from 'src/core/domain';
import { MongoFeedRepository } from '../../infrastructure/repositories/mongodb';

@Injectable()
export class FeedService {
  constructor(private readonly feedRepository: MongoFeedRepository) {}

  async pushFeedItemFromEvent(event: Event, type: string) {
    const feed = await this.feedRepository.create({
      userName: event.hostUsername || 'public',
      eventId: event.id,
      profileId: event.hostId,
      type,
      feedImageUrl: event.imageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('#######################Feed created:', feed);
    return feed;
  }

  async getLatestAll() {
    return this.feedRepository.findAll();
  }

  async getProfileFeed(
    id: string,
    limit: number,
    offset: number,
  ): Promise<Feed[]> {
    const feed = await this.feedRepository.findByProfileId(id);
    return feed;
  }
}
