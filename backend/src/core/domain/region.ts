import { IRegion } from './interfaces/region.interface';
import { Vibe } from './event.schema';

export class Region implements IRegion {
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

  constructor(data: Partial<IRegion>) {
    Object.assign(this, data);
    this.eventIds = data.eventIds || [];
    this.serviceIds = data.serviceIds || [];
    this.commentIds = data.commentIds || [];
    this.likeIds = data.likeIds || [];
    this.followerIds = data.followerIds || [];
    this.shareCount = data.shareCount || 0;
    this.images = data.images || [];
  }
}
