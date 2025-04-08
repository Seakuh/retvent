import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MessageService } from 'src/application/services/message.service';
@WebSocketGateway({ cors: true })
export class MessageGateway implements OnGatewayConnection {
  constructor(private readonly messageService: MessageService) {}

  handleConnection(socket: Socket) {
    console.log('Client connected:', socket.id);
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
    const msg = await this.messageService.create(
      payload.groupId,
      payload.senderId,
      payload.content,
    );
    client.to(payload.groupId).emit('newMessage', msg);
    client.emit('newMessage', msg); // echo to sender
  }
}
