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
    return this.groupFeedsByProfile(feeds);
  }

  async getProfilesFeeds(ids: string[]): Promise<FeedResponse[]> {
    const feeds = await this.feedRepository.findByProfileIds(ids);
    return this.groupFeedsByProfile(feeds);
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
