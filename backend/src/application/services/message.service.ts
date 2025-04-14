import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MongoMessageRepository } from 'src/infrastructure/repositories/mongodb/message.repository';
import { SendMessageDto } from 'src/presentation/dtos/send-message.dto';
import { GroupService } from './group.service';
@Injectable()
export class MessageService {
  constructor(
    private readonly messageRepository: MongoMessageRepository,
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
    console.log(dto);
    const isInGroup = await this.groupService.isUserInGroup(
      dto.groupId,
      userId,
    );
    if (!isInGroup) throw new ForbiddenException('Access denied');

    return this.create(dto.groupId, userId, dto.content);
  }

  async findByGroup(userId: string, groupId: string, limit = 50) {
    const isInGroup = await this.groupService.isUserInGroup(groupId, userId);
    if (!isInGroup) throw new ForbiddenException('Access denied');
    return this.messageRepository.findByGroupId(groupId, limit);
  }

  async findByGroupAndSender(groupId: string, senderId: string) {
    return this.messageRepository.findByGroupIdAndSenderId(groupId, senderId);
  }

  async findByPublicGroup(groupId: string, limit = 50) {
    const group = await this.groupService.getGroupById(groupId);
    if (!group) throw new NotFoundException('Group not found');
    if (!group.isPublic) throw new ForbiddenException('Access denied');
    return this.messageRepository.findByGroupId(groupId, limit);
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
