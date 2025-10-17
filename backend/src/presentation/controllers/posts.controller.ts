import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostService } from 'src/infrastructure/services/post.service';
import { CreatePostDto } from '../dtos/create-post.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

// posts.controller.ts
@Controller('posts')
export class PostsController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: CreatePostDto, @Req() req) {
    return this.postService.createCommunityPost(body, req.user.sub);
  }

  @Get(':communityId')
  async getCommunityPosts(@Param('communityId') communityId: string) {
    return this.postService.getCommunityPosts(communityId);
  }
}
