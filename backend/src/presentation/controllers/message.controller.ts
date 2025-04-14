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
import { SendMessageDto } from '../dtos/send-message.dto';
import { GroupGuard } from '../guards/group.guard';
@Controller('messages')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly groupService: GroupService,
  ) {}

  @Post()
  @UseGuards(GroupGuard)
  async sendMessage(@Req() req, @Body() dto: SendMessageDto) {
    console.log(dto);
    return this.messageService.sendMessage(req.user.id, dto);
  }

  @Get('/guard/:groupId')
  @UseGuards(GroupGuard)
  async getMessagesWithGuard(@Req() req, @Param('groupId') groupId: string) {
    console.log(req.user);
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
  async getMessages(@Param('groupId') groupId: string) {
    return this.messageService.findByPublicGroup(groupId);
  }
}
