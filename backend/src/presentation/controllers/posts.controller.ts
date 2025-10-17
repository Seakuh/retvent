import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { PostService } from 'src/infrastructure/services/post.service';
import { CreatePostDto } from '../dtos/create-post.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

// posts.controller.ts
@Controller('posts')
export class PostsController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Param('communityId') communityId: string,
    @Body() body: CreatePostDto,
  ) {
    return this.postService.createCommunityPost({
      ...body,
      communityId,
      userId: body.userId,
    });
  }
}
