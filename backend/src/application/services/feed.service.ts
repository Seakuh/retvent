import { Injectable } from '@nestjs/common';
import { Event, Feed } from 'src/core/domain';
import {
  FeedItemResponse,
  FeedResponse,
} from 'src/presentation/dtos/feed-response.dto';
import { MongoFeedRepository } from '../../infrastructure/repositories/mongodb';
import { ProfileService } from './profile.service';

@Injectable()
export class FeedService {
  constructor(
    private readonly feedRepository: MongoFeedRepository,
    private readonly profileService: ProfileService,
  ) {}

  async pushFeedItemFromEvent(event: Event, type: string): Promise<Feed> {
    if (event.hostId === 'public') {
      return;
    }
    const feed = await this.feedRepository.create({
      eventId: event.id,
      profileId: event.hostId,
      type,
      feedImageUrl: event.imageUrl,
      startDate: event.startDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('📥 Feed created:', feed);

    return feed;
  }

  async pushFeedItemFromEventPictures(
    event: Event,
    type: string,
    imageUrls: string[],
  ): Promise<void> {
    for (const imageUrl of imageUrls) {
      const feed = await this.feedRepository.create({
        eventId: event.id,
        profileId: event.hostId,
        startDate: event.startDate,
        type,
        feedImageUrl: imageUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('📥 Feed created:', feed);
    }
  }

  async getLatestAll(): Promise<FeedResponse[]> {
    const feeds = await this.feedRepository.findAll();
    return this.groupFeedsByProfile(feeds);
  }

  async getProfileFeed(id: string): Promise<FeedResponse[]> {
    const feeds = await this.feedRepository.findByProfileId(id);
    console.log('🔍 Feeds:', feeds);
    return this.groupFeedsByProfile(feeds);
  }

  async getProfilesFeeds(
    ids: string[],
  ): Promise<Record<string, FeedItemResponse[]>> {
    const feeds = await this.feedRepository.findByProfileIds(ids);
    console.log('🔍 Feeds:', feeds);
    return this.groupFeedsByType(feeds);
  }

  groupFeedsByType(feeds: Feed[]): Record<string, FeedItemResponse[]> {
    const grouped: Record<string, FeedItemResponse[]> = {};

    feeds.forEach((feed) => {
      if (!feed.type) return;

      const type = feed.type.trim();

      if (!grouped[type]) {
        grouped[type] = [];
      }

      grouped[type].push({
        id: feed.id,
        type: feed.type as FeedItemResponse['type'],
        content: feed.content,
        feedImageUrl: feed.feedImageUrl,
        feedGifUrl: feed.feedGifUrl,
        profileId: feed.profileId,
        eventId: feed.eventId,
        messageId: feed.messageId,
        createdAt: feed.createdAt?.toISOString() ?? '',
      });
    });

    return grouped;
  }

  private async groupFeedsByProfile(feeds: Feed[]): Promise<FeedResponse[]> {
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
    return Promise.all(
      Object.entries(grouped)
        .sort((a, b) => {
          const latestA = a[1][0]?.createdAt || '';
          const latestB = b[1][0]?.createdAt || '';
          return latestB.localeCompare(latestA);
        })
        .map(async ([profileId, feedItems]): Promise<FeedResponse> => {
          const feedProfile =
            await this.profileService.getEventProfile(profileId);
          return {
            profileId,
            profileName: feedProfile.username ?? 'Unknown',
            profileImageUrl: feedProfile.profileImageUrl ?? '', // optional: falls Bild mitgegeben wird
            feedItems,
          };
        }),
    );
  }
}
