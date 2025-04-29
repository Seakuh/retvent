export class FeedResponse {
  profileId?: string;
  profileName?: string;
  profileImageUrl?: string;
  feedItems?: FeedItemResponse[];
}

export class FeedProfileResponse {
  id: string;
  name: string;
  imageUrl: string;
  feedItems: FeedItemResponse[];
}

export class FeedItemResponse {
  id: string;
  type:
    | 'event'
    | 'comment'
    | 'message'
    | 'profile'
    | 'post'
    | 'video'
    | 'lineup'
    | 'gif'
    | 'release'
    | 'playlist'
    | 'news'
    | 'update';
  content?: string;
  profileId?: string;
  userName?: string;
  feedImageUrl?: string;
  feedVideoUrl?: string;
  feedPictureUrl?: string;
  feedProfileUrl?: string;
  feedGifUrl?: string;
  eventId?: string;
  messageId?: string;
  createdAt: string;
}
