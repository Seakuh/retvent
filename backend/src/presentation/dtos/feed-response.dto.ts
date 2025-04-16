export class FeedResponse {
  profileId?: string;
  profileName?: string;
  profileImageUrl?: string;
  feedItems?: FeedItemResponse[];
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
    | 'gif'
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
