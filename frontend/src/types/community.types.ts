export type ID = string;

export enum Role {
  ADMIN = "ADMIN",
  HOST = "HOST",
  MEMBER = "MEMBER",
  GUEST = "GUEST",
}

export enum RSVPStatus {
  GOING = "GOING",
  MAYBE = "MAYBE",
  NOT_GOING = "NOT_GOING",
}

export type EventType = "vortrag" | "workshop" | "community" | "other";

export interface Member {
  id: ID;
  name: string;
  role: Role;
  avatarUrl?: string;
  title?: string;
  bio?: string;
  joinedAt: string;
  location?: string;
  tags?: string[];
}

export interface Partner {
  id: ID;
  name: string;
  logoUrl: string;
  websiteUrl: string;
}

export interface CommunityStats {
  members: number;
  upcomingEvents: number;
  postsLast30Days: number;
}

export interface Community {
  id: ID;
  slug: string;
  name: string;
  description: string;
  coverImageUrl?: string;
  logoUrl?: string;
  stats: CommunityStats;
  partners: Partner[];
  members: Member[];
  featuredTags?: string[];
}

export interface FeedReactions {
  thumbs: number;
  fire: number;
  star: number;
}

export interface BaseFeedItem {
  id: ID;
  kind: "news" | "poll";
  authorId: ID;
  createdAt: string;
  updatedAt?: string;
  commentIds: ID[];
  reactions: FeedReactions;
}

export interface NewsPost extends BaseFeedItem {
  kind: "news";
  title: string;
  body: string;
  imageUrl?: string;
  pinned?: boolean;
}

export interface PollOption {
  id: ID;
  label: string;
  votes: number;
}

export interface Poll extends BaseFeedItem {
  kind: "poll";
  question: string;
  options: PollOption[];
  closesAt?: string;
  visibility: "public" | "members";
  votesByUser: Record<ID, ID>;
}

export type FeedItem = NewsPost | Poll;

export interface Comment {
  id: ID;
  postId: ID;
  authorId: ID;
  content: string;
  createdAt: string;
  parentId?: ID;
  deleted?: boolean;
}

export interface Event {
  id: ID;
  communityId: ID;
  title: string;
  description: string;
  type: EventType;
  location: string;
  startAt: string;
  endAt: string;
  capacity?: number;
  hostId: ID;
  imageUrl?: string;
  attendees: Array<{ userId: ID; status: RSVPStatus }>;
}

export interface NewsPostInput {
  communitySlug: string;
  authorId: ID;
  title: string;
  body: string;
  imageUrl?: string;
}

export interface PollInput {
  communitySlug: string;
  authorId: ID;
  question: string;
  options: string[];
  closesAt?: string;
  visibility: "public" | "members";
}

export interface EventInput {
  communitySlug: string;
  authorId: ID;
  title: string;
  description: string;
  type: EventType;
  location: string;
  startAt: string;
  endAt: string;
  capacity?: number;
  imageUrl?: string;
}

export interface CommentInput {
  communitySlug: string;
  postId: ID;
  authorId: ID;
  content: string;
  parentId?: ID;
}

export interface ConnectResponse {
  status: "pending" | "accepted";
}

