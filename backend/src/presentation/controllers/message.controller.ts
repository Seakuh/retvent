import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from 'src/application/services/message.service';
import { SendMessageDto } from '../dtos/send-message.dto';
import { GroupGuard } from '../guards/group.guard';
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get(':groupId')
  @UseGuards(GroupGuard)
  async getMessages(@Req() req, @Param('groupId') groupId: string) {
    return this.messageService.findByGroup(req.user.id, groupId);
  }

  @Post()
  @UseGuards(GroupGuard)
  async sendMessage(@Req() req, @Body() dto: SendMessageDto) {
    return this.messageService.sendMessage(req.user.id, dto);
  }
}
