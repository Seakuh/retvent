import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { VoiceChatService } from 'src/application/services/voice-chat/voice-chat.service';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';

@Controller('voice-chat')
@UseGuards(JwtAuthGuard)
export class VoiceChatController {
  constructor(private readonly voiceChatService: VoiceChatService) {}

  @Get(':groupId/participants')
  getParticipants(@Param('groupId') groupId: string) {
    return {
      participants: this.voiceChatService.getParticipants(groupId),
    };
  }

  @Get(':groupId/status')
  getStatus(@Param('groupId') groupId: string) {
    const participants = this.voiceChatService.getParticipants(groupId);
    return {
      isActive: participants.length > 0,
      participantCount: participants.length,
      participants,
    };
  }
}
