import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group } from 'src/core/domain/group';

export interface VoiceChatParticipant {
  userId: string;
  username: string;
  socketId: string;
  isMuted: boolean;
  joinedAt: Date;
}

export interface VoiceChat {
  groupId: string;
  participants: Map<string, VoiceChatParticipant>;
  startedAt: Date;
}

@Injectable()
export class VoiceChatService {
  private activeChats: Map<string, VoiceChat> = new Map();

  constructor(@InjectModel(Group.name) private groupModel: Model<Group>) {}

  async joinVoiceChat(
    groupId: string,
    userId: string,
    username: string,
    socketId: string,
  ): Promise<VoiceChatParticipant[]> {
    // Check if user is member of group
    const group = await this.groupModel.findById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    if (!group.memberIds.includes(userId)) {
      throw new Error('User is not a member of this group');
    }

    // Get or create voice chat
    let voiceChat = this.activeChats.get(groupId);
    if (!voiceChat) {
      voiceChat = {
        groupId,
        participants: new Map(),
        startedAt: new Date(),
      };
      this.activeChats.set(groupId, voiceChat);
    }

    // Add participant
    const participant: VoiceChatParticipant = {
      userId,
      username,
      socketId,
      isMuted: false,
      joinedAt: new Date(),
    };

    voiceChat.participants.set(userId, participant);

    // Return all participants
    return Array.from(voiceChat.participants.values());
  }

  leaveVoiceChat(groupId: string, userId: string): void {
    const voiceChat = this.activeChats.get(groupId);
    if (!voiceChat) return;

    voiceChat.participants.delete(userId);

    // Clean up empty voice chats
    if (voiceChat.participants.size === 0) {
      this.activeChats.delete(groupId);
    }
  }

  getParticipants(groupId: string): VoiceChatParticipant[] {
    const voiceChat = this.activeChats.get(groupId);
    if (!voiceChat) return [];

    return Array.from(voiceChat.participants.values());
  }

  updateMuteStatus(groupId: string, userId: string, isMuted: boolean): void {
    const voiceChat = this.activeChats.get(groupId);
    if (!voiceChat) return;

    const participant = voiceChat.participants.get(userId);
    if (participant) {
      participant.isMuted = isMuted;
    }
  }

  getParticipantBySocketId(
    socketId: string,
  ): { groupId: string; userId: string } | null {
    for (const [groupId, voiceChat] of this.activeChats.entries()) {
      for (const [userId, participant] of voiceChat.participants.entries()) {
        if (participant.socketId === socketId) {
          return { groupId, userId };
        }
      }
    }
    return null;
  }

  isUserInVoiceChat(groupId: string, userId: string): boolean {
    const voiceChat = this.activeChats.get(groupId);
    if (!voiceChat) return false;
    return voiceChat.participants.has(userId);
  }
}
