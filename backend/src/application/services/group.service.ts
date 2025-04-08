import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto } from 'src/presentation/dtos/create-group.dto';
import { UpdateGroupDto } from 'src/presentation/dtos/update-group.dto';
import { v4 as uuidv4 } from 'uuid';
import { MongoGroupRepository } from '../../infrastructure/repositories/mongodb/group.repository';

@Injectable()
export class GroupService {
  constructor(private readonly groupRepository: MongoGroupRepository) {}

  async createGroup(userId: string, dto: CreateGroupDto) {
    console.log('userid: ', userId);
    const inviteToken = uuidv4();
    const group = {
      ...dto,
      inviteToken,
      creatorId: userId,
      memberIds: [userId],
      eventIds: [],
    };
    return await this.groupRepository.createGroup(userId, group);
  }

  async createGroupWithEvent(userId: string, dto: CreateGroupDto) {
    const inviteToken = uuidv4();
    console.log(dto, userId);
    return await this.groupRepository.createGroupWithEvent({
      creatorId: userId,
      memberIds: [userId],
      inviteToken,
      eventIds: dto.eventIds,
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
