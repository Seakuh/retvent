import {
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { CreateGroupDto } from 'src/presentation/dtos/create-group.dto';
import { UpdateGroupDto } from 'src/presentation/dtos/update-group.dto';
import { v4 as uuidv4 } from 'uuid';
import { MongoGroupRepository } from '../../infrastructure/repositories/mongodb/group.repository';
@Injectable()
export class GroupService {
  constructor(private readonly groupRepository: MongoGroupRepository) {}

  async createGroup(userId: string, dto: CreateGroupDto) {
    return await this.groupRepository.createGroup(userId, dto);
  }

  async getGroupsByUserId(userId: string) {
    return await this.groupRepository.getGroupsByUserId(userId);
  }

  async getGroupWithLatestMessage(userId: string, groupId: string) {
    throw new NotImplementedException();
    // const group = await this.groupRepository.findById(groupId);
    // if (!group) throw new NotFoundException('Group not found');
    // const messages = await this.messageService.findByGroup(userId, groupId);
    // return { ...group, messages };
  }

  async addMemberToGroup(groupId: string, userId: string) {
    const group = await this.groupRepository.findById(groupId);
    if (!group) throw new NotFoundException('Group not found');
    group.memberIds.push(userId);
    return this.groupRepository.update(groupId, group);
  }

  async createOrJoinGroup(userId: string, dto: CreateGroupDto) {
    console.log('createOrJoinGroup', userId, dto);
    const group = await this.groupRepository.findByGroupName(dto.name);
    if (userId) {
      if (group) {
        return this.addMemberToGroup(group.id, userId);
      }
    }
    if (group) {
      return group;
    }
    return this.createGroup(null, dto);
  }

  async createGroupWithEvent(userId: string, dto: CreateGroupDto) {
    const inviteToken = uuidv4();
    console.log(dto, userId);
    return await this.groupRepository.createGroupWithEvent({
      ...dto,
      creatorId: userId,
      memberIds: [userId],
      inviteToken,
      imageUrl: dto.imageUrl,
      eventId: dto.eventId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async joinGroup(userId: string, token: string) {
    const group = await this.groupRepository.findByInviteToken(token);
    if (!group) throw new NotFoundException('Group not found');
    if (!group.memberIds.includes(userId)) {
      group.memberIds.push(userId);
      await this.groupRepository.update(group.id, group);
    }
    return group;
  }

  async isUserInGroup(groupId: string, userId: string) {
    console.log(groupId, userId);
    const group = await this.groupRepository.findById(groupId);
    if (!group) throw new NotFoundException('Group not found');
    return group.memberIds.includes(userId);
  }

  async leaveGroup(userId: string, groupId: string) {
    const group = await this.groupRepository.findById(groupId);
    if (!group) throw new NotFoundException('Group not found');

    group.memberIds = group.memberIds.filter((id) => id !== userId);
    return this.groupRepository.update(groupId, group);
  }

  async getGroupById(groupId: string) {
    return this.groupRepository.findById(groupId);
  }

  async updateGroup(groupId: string, dto: UpdateGroupDto) {
    const group = await this.groupRepository.findById(groupId);
    if (!group) throw new NotFoundException('Group not found');

    group.name = dto.name;
    group.description = dto.description;
    group.isPublic = dto.isPublic;
    return this.groupRepository.update(groupId, group);
  }

  async deleteGroup(groupId: string) {
    const result = await this.groupRepository.delete(groupId);
    return result !== null;
  }
}
