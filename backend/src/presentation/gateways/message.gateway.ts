import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GroupService } from 'src/application/services/group.service';
import { MessageService } from 'src/application/services/message.service';

@WebSocketGateway({ cors: true })
export class MessageGateway implements OnGatewayConnection, OnGatewayInit {
  private server: Server;

  constructor(
    private readonly messageService: MessageService,
    private readonly groupService: GroupService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit(server: Server) {
    this.server = server;

    // Auth-Middleware
    this.server.use((socket, next) => {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new UnauthorizedException('Kein Token'));

      try {
        const decoded = this.jwtService.verify(token);
        (socket as any).user = decoded;
        next();
      } catch (err) {
        next(new UnauthorizedException('Ungültiges Token'));
      }
    });
  }

  handleConnection(socket: Socket) {
    const user = (socket as any).user;
    console.log(`Socket ${socket.id} connected. User: ${user?.userId}`);
  }

  @SubscribeMessage('joinGroup')
  handleJoin(
    @MessageBody() groupId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(groupId);
    console.log(`Client ${client.id} joined group ${groupId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    payload: { groupId: string; senderId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = (client as any).user?.userId;

    const isInGroup = await this.groupService.isUserInGroup(
      payload.groupId,
      userId,
    );
    if (!isInGroup) {
      client.emit('errorMessage', 'Access denied - not in group');
      return;
    }

    const msg = await this.messageService.create(
      payload.groupId,
      userId,
      payload.content,
    );
    this.server.to(payload.groupId).emit('newMessage', msg);
  }
}
