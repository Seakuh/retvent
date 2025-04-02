import { IProfile } from './interfaces/profile.interface';

export class Profile implements IProfile {
  id: string;
  username: string;
  email: string;
  gallery?: string[];
  userId: string;
  profileImageUrl?: string;
  headerImageUrl?: string;
  category?: string;
  followerCount?: number;
  bio?: string;
  followedLocationIds?: string[];
  likedEventIds?: string[];
  createdEventIds?: string[];
  links?: string[];
  followers?: string[];
  following?: string[];
  createdAt: Date;
  updatedAt: Date;
  queue?: string;
  doorPolicy?: string;
  preferences?: UserPreferences;
  embedding?: number[];
  constructor(data: Partial<IProfile>) {
    Object.assign(this, data);
  }
}

interface PreferenceCategory {
  [key: string]: string[]; // e.g. "Concert": ["Jazz", "Acoustic"]
}

export interface UserPreferences {
  eventType?: PreferenceCategory;
  genreStyle?: PreferenceCategory;
  context?: PreferenceCategory;
  communityOffers?: PreferenceCategory;
}

export interface ProfileEventDetail {
  profileImageUrl: string;
  username: string;
}

export interface SearchParams {
  query: string;
  location?: string;
  dateRange?: { start: string; end: string };
}

export interface ProfileServicePort {
  searchProfiles(params: SearchParams): Promise<Profile[]>;
}
