export interface IProfile {
  username: string;
  email?: string;
  gallery?: string[];
  // reference to user id
  userId?: string;
  profileImageUrl?: string;
  headerImageUrl?: string;
  category?: string;
  followerCount?: number;
  bio?: string;
  telephoneNumber?: string;
  followedLocationIds?: string[];
  likedEventIds?: string[];
  createdEventIds?: string[];
  links?: string[];
  followers?: string[];
  following?: string[];
  giphyLinks?: string[];
  createdAt: Date;
  updatedAt: Date;
  queue?: string;
  doorPolicy?: string;
}
