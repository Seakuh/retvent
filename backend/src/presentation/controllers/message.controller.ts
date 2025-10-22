import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GroupService } from 'src/application/services/group.service';
import { MessageService } from 'src/application/services/message.service';
import { ImageService } from 'src/infrastructure/services/image.service';
import { SendMessageDto } from '../dtos/send-message.dto';
import { SendPrivateMessageDto } from '../dtos/send-private-message.dto';
import { GroupGuard } from '../guards/group.guard';
@Controller('messages')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly groupService: GroupService,
    private readonly imageService: ImageService,
  ) {}

  @Post()
  @UseGuards(GroupGuard)
  async sendMessage(@Req() req, @Body() dto: SendMessageDto) {
    return this.messageService.sendMessage(req.user.id, dto);
  }

  @Get('/guard/:groupId')
  @UseGuards(GroupGuard)
  async getMessagesWithGuard(@Req() req, @Param('groupId') groupId: string) {
    const isInGroup = await this.groupService.isUserInGroup(
      groupId,
      req.user.id,
    );
    if (!isInGroup) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return this.messageService.findByGroup(req.user.id, groupId);
  }

  @Get(':groupId')
  @UseGuards(GroupGuard)
  async getMessages(@Req() req, @Param('groupId') groupId: string) {
    return this.messageService.findByPublicGroup(req.user.id, groupId);
  }

  @Post('private')
  @UseGuards(GroupGuard)
  async sendPrivateMessage(@Req() req, @Body() dto: SendPrivateMessageDto) {
    let fileUrl = dto.fileUrl;
    if (dto.file) {
      fileUrl = await this.imageService.uploadImage(dto.file);
    }

    return this.messageService.sendPrivateMessage(
      req.user.id,
      dto.recipientId,
      dto.content,
      fileUrl,
      dto.latitude,
      dto.longitude,
      dto.type,
    );
  }

  @Get('private/conversation/:userId')
  @UseGuards(GroupGuard)
  async getPrivateConversation(
    @Req() req,
    @Param('userId') otherUserId: string,
  ) {
    return this.messageService.getPrivateMessagesBetweenUsers(
      req.user.id,
      otherUserId,
    );
  }

  @Get('private/all')
  @UseGuards(GroupGuard)
  async getAllPrivateMessages(@Req() req) {
    return this.messageService.getPrivateMessagesForUser(req.user.id);
  }
}
