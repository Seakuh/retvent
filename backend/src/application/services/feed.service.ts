import { Injectable } from '@nestjs/common';
import { Event, Feed } from 'src/core/domain';
import {
  FeedItemResponse,
  FeedResponse,
} from 'src/presentation/dtos/feed-response.dto';
import { MongoFeedRepository } from '../../infrastructure/repositories/mongodb';

@Injectable()
export class FeedService {
  constructor(private readonly feedRepository: MongoFeedRepository) {}

  async pushFeedItemFromEvent(event: Event, type: string): Promise<Feed> {
    const feed = await this.feedRepository.create({
      userName: event.hostUsername || 'public',
      eventId: event.id,
      profileId: event.hostId,
      type,
      feedImageUrl: event.imageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('📥 Feed created:', feed);
    }

    return feed;
  }

  async getLatestAll(): Promise<FeedResponse[]> {
    const feeds = await this.feedRepository.findAll();
    return this.groupFeedsByProfile(feeds);
  }

  async getProfileFeed(id: string): Promise<FeedResponse[]> {
    const feeds = await this.feedRepository.findByProfileId(id);
    return this.groupFeedsByProfile(feeds);
  }

  async getProfilesFeeds(ids: string[]): Promise<FeedResponse[]> {
    const feeds = await this.feedRepository.findByProfileIds(ids);
    return this.groupFeedsByProfile(feeds);
  }

  private groupFeedsByProfile(feeds: Feed[]): FeedResponse[] {
    const grouped: Record<string, FeedItemResponse[]> = {};

    feeds.forEach((feed) => {
      if (!feed.profileId) return;

      const profileId = feed.profileId.trim();

      if (!grouped[profileId]) {
        grouped[profileId] = [];
      }

      grouped[profileId].push({
        id: feed.id,
        type: feed.type as FeedItemResponse['type'],
        content: feed.content,
        feedImageUrl: feed.feedImageUrl,
        feedGifUrl: feed.feedGifUrl,
        profileId,
        eventId: feed.eventId,
        messageId: feed.messageId,
        createdAt: feed.createdAt?.toISOString() ?? '',
      });
    });

    // Sortieren nach profileId alphabetisch (optional)
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([profileId, feedItems]): FeedResponse => {
        const firstFeed = feedItems[0]; // Nehmen wir als Quelle für den Namen

        return {
          profileId,
          profileName: firstFeed.userName ?? 'Unknown',
          profileImageUrl: firstFeed.feedImageUrl ?? '', // optional: falls Bild mitgegeben wird
          feedItems,
        };
      });
  }
}
