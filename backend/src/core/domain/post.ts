export interface IPost {
  profileId: string;
  eventId: string;
  startDate: Date;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  userName?: string;
  feedImageUrl?: string;
  feedGifUrl?: string;
}
