import { Feed } from '../domain';

export interface IFeedRepository {
  create(feed: Feed): Promise<Feed>;
  findByProfileId(profileId: string): Promise<Feed[]>;
  findByEventId(eventId: string): Promise<Feed[]>;
  findByGroupId(groupId: string): Promise<Feed[]>;
  findByUserId(userId: string): Promise<Feed[]>;
}
