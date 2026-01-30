import { VibeDto } from './create-region.dto';

export class RegionResponseDto {
  id: string;
  name: string;
  description: string;
  slug: string;
  logoUrl?: string;
  images?: string[];
  vibe?: VibeDto;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  country?: string;
  parentRegion?: string;
  eventIds?: string[];
  serviceIds?: string[];
  commentIds?: string[];
  likeIds?: string[];
  shareCount?: number;
  followerIds?: string[];
  metaDescription?: string;
  h1?: string;
  introText?: string;
  createdAt: Date;
  updatedAt: Date;
}
