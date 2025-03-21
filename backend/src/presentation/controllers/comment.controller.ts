import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from 'src/application/services/comment.service';
import { CreateCommentDto } from '../dtos/create-comment.dto';
import { CommentGuard } from '../guards/comment.guard';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  //   @Post()
  //   async createComment(@Body() comment: CreateCommentDto) {
  //     return this.commentService.create(comment);
  //   }

  @Get('/event/:eventId')
  async getCommentsByEventId(@Param('eventId') eventId: string) {
    return this.commentService.findByEventId(eventId);
  }

  //   export const createCommentToEvent = async (comment: Comment) => {
  //     const response = await fetch(`${API_URL}comments`, {
  //       method: "POST",
  //       body: JSON.stringify(comment),
  //     });
  //     return response.json();
  //   };

  @Post('/event/:eventId')
  @UseGuards(CommentGuard)
  async createCommentToEvent(
    @Param('eventId') eventId: string,
    @Body() comment: CreateCommentDto,
    @Req() req: any,
  ) {
    console.log('Received comment data:', comment);
    console.log('Event ID:', eventId);
    console.log('User:', req.user);
    console.log('Parent ID:', comment.parentId);

    if (!comment || typeof comment.text !== 'string') {
      throw new BadRequestException('Der Kommentar muss einen Text enthalten');
    }

    if (!eventId || typeof eventId !== 'string') {
      throw new BadRequestException('Eine gültige Event-ID ist erforderlich');
    }

    const userId = req.user?.id || 'public';
    return this.commentService.createCommentToEvent(eventId, comment, userId);
  }
}

// export const fetchComments = async (eventId: string) => {
//   const response = await fetch(`${API_URL}/comments/${eventId}`);
//   return response.json();
// };

// export const createCommentToEvent = async (comment: Comment) => {
//   const response = await fetch(`${API_URL}/comments`, {
//     method: 'POST',
//     body: JSON.stringify(comment),
//   });
//   return response.json();
// };

// export const updateComment = async (comment: Comment) => {
//   const response = await fetch(`${API_URL}/comments/${comment.id}`, {
//     method: 'PUT',
//     body: JSON.stringify(comment),
//   });
//   return response.json();
// };

// export const deleteComment = async (commentId: string) => {
//   const response = await fetch(`${API_URL}/comments/${commentId}`, {
//     method: 'DELETE',
//   });
//   return response.json();
// };

// export const getCommentsByEventId = async (eventId: string) => {
//   const response = await fetch(`${API_URL}/comments/event/${eventId}`);
//   return response.json();
// };

// export const getCommentsByUserId = async (userId: string) => {
//   const response = await fetch(`${API_URL}/comments/user/${userId}`);
//   return response.json();
// };
