import { ForbiddenException, Injectable } from '@nestjs/common';
import { IMessageRepository } from 'src/core/repositories/message.repository.interface';
import { SendMessageDto } from 'src/presentation/dtos/send-message.dto';
import { GroupService } from './group.service';
@Injectable()
export class MessageService {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly groupService: GroupService,
  ) {}

  async create(groupId: string, senderId: string, content: string) {
    const msg = await this.messageRepository.create({
      groupId,
      senderId,
      content,
    });
    return msg;
  }

  async sendMessage(userId: string, dto: SendMessageDto) {
    const isInGroup = await this.groupService.isUserInGroup(
      dto.groupId,
      userId,
    );
    if (!isInGroup) throw new ForbiddenException('Access denied');

    return this.create(dto.groupId, userId, dto.content);
  }

  async findByGroup(userId: string, groupId: string, limit = 50) {
    return this.messageRepository.findByGroupId(groupId, limit);
  }

  async findByGroupAndSender(groupId: string, senderId: string) {
    return this.messageRepository.findByGroupIdAndSenderId(groupId, senderId);
  }

  async findByGroupAndSenderAndContent(
    groupId: string,
    senderId: string,
    content: string,
  ) {
    return this.messageRepository.findByGroupIdAndSenderIdAndContent(
      groupId,
      senderId,
      content,
    );
  }
}
