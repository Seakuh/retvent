import { Post } from 'src/infrastructure/schemas/post.schema';
import { CreateCommunityPostDto } from 'src/presentation/dtos/create-community-post.dto';

export interface IPostRepository {
  getComments(postId: string);
  createCommunityPost(createCommunityPostDto: CreateCommunityPostDto);
  findCommunityPosts(communityId: string);
  findCommunityPostsByUserId(userId: string);
  findCommunityPostsByUserIdAndCommunityId(userId: string, communityId: string);
  deleteCommunityPost(postId: string);
  updateCommunityPost(postId: string, post: Partial<Post>);
}
