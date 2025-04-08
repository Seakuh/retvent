import { Controller, Get, Param } from '@nestjs/common';
import { MessageService } from 'src/application/services/message.service';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get(':groupId')
  getMessages(@Param('groupId') groupId: string) {
    return this.messageService.findByGroup(groupId);
  }
}
