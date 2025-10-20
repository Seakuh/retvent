import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IPostRepository } from 'src/core/repositories/post.repository.interface';
import { PostDocument } from 'src/infrastructure/schemas/post.schema';

export class MongoPostRepository implements IPostRepository {
  constructor(@InjectModel('Post') private postModel: Model<PostDocument>) {}

  async createCommunityPost(createCommunityPostDto: any) {
    return this.postModel.create({
      ...createCommunityPostDto,
      startDate: new Date(),
    });
  }

  async getComments(postId: string) {
    return this.postModel.find({ postId }).sort({ createdAt: -1 });
  }

  async findCommunityPosts(communityId: string) {
    return this.postModel.find({ communityId });
  }

  async addLike(postId: string, userId: string) {
    return this.postModel.findByIdAndUpdate(
      postId,
      { $addToSet: { likeIds: userId } },
      { new: true },
    );
  }

  async removeLike(postId: string, userId: string) {
    return this.postModel.findByIdAndUpdate(
      postId,
      { $pull: { likeIds: userId } },
      { new: true },
    );
  }

  async findCommunityPostsByUserId(userId: string) {
    return this.postModel.find({ userId });
  }
  async findCommunityPostsByUserIdAndCommunityId(
    userId: string,
    communityId: string,
  ) {
    return this.postModel.find({ userId, communityId });
  }

  deleteCommunityPost(postId: string) {
    return this.postModel.findByIdAndDelete(postId);
  }

  updateCommunityPost(postId: string, post: Partial<PostDocument>) {
    return this.postModel.findByIdAndUpdate(postId, post, { new: true });
  }

  async getCommunityPosts(communityId: string, offset: number, limit: number) {
    return this.postModel
      .find({ communityId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
  }

  createComment(postId: string, text: string, userId: string) {
    return this.postModel.create({
      postId,
      text,
      userId,
      createdAt: new Date(),
    });
  }
}
