import { IFollower } from './interfaces/follower.interface';

export class Follower implements IFollower {
  followerId: string;
  followedId: string;
  createdAt: Date;
}
