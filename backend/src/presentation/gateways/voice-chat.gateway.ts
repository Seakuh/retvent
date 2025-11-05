import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { VoiceChatService } from 'src/application/services/voice-chat/voice-chat.service';

interface AuthSocket extends Socket {
  user?: {
    userId: string;
    username: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/voice-chat',
})
export class VoiceChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly voiceChatService: VoiceChatService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit(server: Server) {
    console.log('Voice Chat Gateway initialized');

    // Auth middleware
    server.use((socket: AuthSocket, next) => {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new UnauthorizedException('No token provided'));
      }

      try {
        const decoded = this.jwtService.verify(token);
        socket.user = {
          userId: decoded.sub, // JWT uses 'sub' field for user ID
          username: decoded.username,
        };
        next();
      } catch (err) {
        console.error('Voice Chat JWT verification failed:', err);
        next(new UnauthorizedException('Invalid token'));
      }
    });
  }

  handleConnection(socket: AuthSocket) {
    const user = socket.user;
    console.log(
      `Voice Chat: Socket ${socket.id} connected. User: ${user?.userId}`,
    );
  }

  handleDisconnect(socket: AuthSocket) {
    console.log(`Voice Chat: Socket ${socket.id} disconnected`);

    // Find user in active voice chats and remove them
    const result = this.voiceChatService.getParticipantBySocketId(socket.id);
    if (result) {
      this.voiceChatService.leaveVoiceChat(result.groupId, result.userId);

      // Notify others in the room
      this.server.to(result.groupId).emit('user-left', {
        userId: result.userId,
        participants: this.voiceChatService.getParticipants(result.groupId),
      });
    }
  }

  @SubscribeMessage('join-voice-chat')
  async handleJoinVoiceChat(
    @MessageBody() data: { groupId: string },
    @ConnectedSocket() socket: AuthSocket,
  ) {
    const { groupId } = data;
    const user = socket.user;

    if (!user) {
      socket.emit('error', { message: 'Unauthorized' });
      return;
    }

    try {
      // Join voice chat
      const participants = await this.voiceChatService.joinVoiceChat(
        groupId,
        user.userId,
        user.username,
        socket.id,
      );

      // Join socket room
      socket.join(groupId);

      // Notify user of successful join
      socket.emit('joined-voice-chat', {
        groupId,
        participants,
      });

      // Notify others in the room
      socket.to(groupId).emit('user-joined', {
        userId: user.userId,
        username: user.username,
        participants,
      });

      console.log(`User ${user.userId} joined voice chat in group ${groupId}`);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('leave-voice-chat')
  handleLeaveVoiceChat(
    @MessageBody() data: { groupId: string },
    @ConnectedSocket() socket: AuthSocket,
  ) {
    const { groupId } = data;
    const user = socket.user;

    if (!user) return;

    this.voiceChatService.leaveVoiceChat(groupId, user.userId);
    socket.leave(groupId);

    const participants = this.voiceChatService.getParticipants(groupId);

    // Notify others in the room
    this.server.to(groupId).emit('user-left', {
      userId: user.userId,
      participants,
    });

    console.log(`User ${user.userId} left voice chat in group ${groupId}`);
  }

  @SubscribeMessage('toggle-mute')
  handleToggleMute(
    @MessageBody() data: { groupId: string; isMuted: boolean },
    @ConnectedSocket() socket: AuthSocket,
  ) {
    const { groupId, isMuted } = data;
    const user = socket.user;

    if (!user) return;

    this.voiceChatService.updateMuteStatus(groupId, user.userId, isMuted);

    // Notify others in the room
    this.server.to(groupId).emit('user-mute-changed', {
      userId: user.userId,
      isMuted,
    });

    console.log(
      `User ${user.userId} ${isMuted ? 'muted' : 'unmuted'} in group ${groupId}`,
    );
  }

  // WebRTC Signaling
  @SubscribeMessage('offer')
  handleOffer(
    @MessageBody() data: { groupId: string; targetUserId: string; offer: any },
    @ConnectedSocket() socket: AuthSocket,
  ) {
    const { groupId, targetUserId, offer } = data;
    const user = socket.user;

    if (!user) return;

    // Find target user's socket
    const participants = this.voiceChatService.getParticipants(groupId);
    const targetParticipant = participants.find(
      (p) => p.userId === targetUserId,
    );

    if (targetParticipant) {
      this.server.to(targetParticipant.socketId).emit('offer', {
        fromUserId: user.userId,
        offer,
      });
    }
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @MessageBody() data: { groupId: string; targetUserId: string; answer: any },
    @ConnectedSocket() socket: AuthSocket,
  ) {
    const { groupId, targetUserId, answer } = data;
    const user = socket.user;

    if (!user) return;

    // Find target user's socket
    const participants = this.voiceChatService.getParticipants(groupId);
    const targetParticipant = participants.find(
      (p) => p.userId === targetUserId,
    );

    if (targetParticipant) {
      this.server.to(targetParticipant.socketId).emit('answer', {
        fromUserId: user.userId,
        answer,
      });
    }
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @MessageBody()
    data: { groupId: string; targetUserId: string; candidate: any },
    @ConnectedSocket() socket: AuthSocket,
  ) {
    const { groupId, targetUserId, candidate } = data;
    const user = socket.user;

    if (!user) return;

    // Find target user's socket
    const participants = this.voiceChatService.getParticipants(groupId);
    const targetParticipant = participants.find(
      (p) => p.userId === targetUserId,
    );

    if (targetParticipant) {
      this.server.to(targetParticipant.socketId).emit('ice-candidate', {
        fromUserId: user.userId,
        candidate,
      });
    }
  }
}
