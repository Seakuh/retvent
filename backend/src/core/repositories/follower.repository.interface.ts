import { Follower } from '../domain/follower';

export interface IFollowerRepository {
  create(follower: Follower): Promise<Follower>;
  findByFollowerId(followerId: string): Promise<Follower | null>;
  findByFollowedId(followedId: string): Promise<Follower[]>;
  delete(follower: Follower): Promise<boolean>;
}
