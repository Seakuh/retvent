import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CommunityService } from 'src/application/services/community.service';
import { PostService } from 'src/infrastructure/services/post.service';
import { CreatePostDto } from '../dtos/create-post.dto';
import { CommunityMemberGuard } from '../guards/community-member.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

// posts.controller.ts
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postService: PostService,
    private readonly communityService: CommunityService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 10)) // Support up to 10 images
  @UseGuards(JwtAuthGuard) // Use JwtAuthGuard instead of CommunityMemberGuard for multipart
  async create(
    @Body() body: CreatePostDto,
    @Req() req,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    if (!req.user) {
      throw new NotFoundException('User not found');
    }

    // Manually check community membership (since Guard runs before Interceptor)
    const community = await this.communityService.findById(body.communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    if (!community.members.includes(req.user.sub)) {
      throw new ForbiddenException('You are not a member of this community');
    }

    return this.postService.createCommunityPost(
      {
        ...body,
      },
      req.user.sub,
      images,
    );
  }

  @Get(':communityId')
  async getCommunityPosts(
    @Param('communityId') communityId: string,
    @Query('offset') offset: number = 0,
    @Query('limit') limit: number = 20,
  ) {
    return this.postService.getCommunityPosts(communityId, offset, limit);
  }

  @Post('comment/:communityId')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Body() body: { communityId: string; postId: string; text: string },
    @Req() req,
  ) {
    return this.postService.createComment(
      body.communityId,
      body.postId,
      body.text,
      req.user.sub,
    );
  }

  @Get('comments/:postId')
  @UseGuards(JwtAuthGuard, CommunityMemberGuard)
  async getComments(
    @Param('postId') postId: string,
    @Body() body: { communityId: string },
  ) {
    const comments = await this.postService.getComments(postId);
    if (!comments) {
      throw new NotFoundException('Comments not found');
    }
    return comments;
  }
  @Post('like/:postId')
  @UseGuards(JwtAuthGuard, CommunityMemberGuard)
  async addLike(
    @Param('postId') postId: string,
    @Body() body: { communityId: string },
    @Req() req,
  ) {
    return this.postService.addLike(postId, req.user.sub);
  }
  @Delete('like/:postId')
  @UseGuards(JwtAuthGuard, CommunityMemberGuard)
  async removeLike(@Param('postId') postId: string, @Req() req) {
    return this.postService.removeLike(postId, req.user.sub);
  }
}
