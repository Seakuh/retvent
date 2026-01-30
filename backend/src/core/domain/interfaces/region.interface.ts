import { Vibe } from '../event.schema';

export interface IRegion {
  id: string;
  name: string;
  description: string;
  slug: string;
  logoUrl?: string;
  images?: string[];
  vibe?: Vibe;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  country?: string;
  parentRegion?: string; // Land/State
  eventIds?: string[];
  serviceIds?: string[];
  commentIds?: string[];
  likeIds?: string[];
  shareCount?: number;
  followerIds?: string[];
  // SEO-Felder
  metaDescription?: string;
  h1?: string;
  introText?: string;
  createdAt: Date;
  updatedAt: Date;
}
