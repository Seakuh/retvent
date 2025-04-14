import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MongoMessageRepository } from 'src/infrastructure/repositories/mongodb/message.repository';
import { ImageService } from 'src/infrastructure/services/image.service';
import { SendMessageDto } from 'src/presentation/dtos/send-message.dto';
import { GroupService } from './group.service';
@Injectable()
export class MessageService {
  constructor(
    private readonly messageRepository: MongoMessageRepository,
    private readonly groupService: GroupService,
    private readonly imageService: ImageService,
  ) {}

  async create(
    groupId: string,
    senderId: string,
    content: string,
    fileUrl: string,
    latitude?: number | null,
    longitude?: number | null,
    type?: string | null,
  ) {
    const msg = await this.messageRepository.create({
      groupId,
      senderId,
      content,
      fileUrl: fileUrl,
      latitude: latitude || null,
      longitude: longitude || null,
      type: type || null,
    });
    return msg;
  }

  async sendMessage(userId: string, dto: SendMessageDto) {
    if (userId) {
      await this.groupService.addMemberToGroup(dto.groupId, userId);
    }
    if (dto.file) {
      const fileUrl = await this.imageService.uploadImage(dto.file);
      dto.fileUrl = fileUrl;
    }
    if (dto.latitude && dto.longitude) {
      return this.create(
        dto.groupId,
        userId,
        dto.content || '',
        dto.fileUrl || '',
        dto.latitude,
        dto.longitude,
        dto.type,
      );
    }
    return this.create(
      dto.groupId,
      userId,
      dto.content || '',
      dto.fileUrl || '',
    );
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
