import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Sponsor } from './entities/sponsor.entity';

@WebSocketGateway({
  cors: {
    origin: '*', // Configure based on your frontend URL
  },
  namespace: 'sponsors',
})
export class SponsoringGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SponsoringGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribeToEvent')
  handleSubscribeToEvent(
    @MessageBody() eventId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`event-${eventId}`);
    this.logger.log(`Client ${client.id} subscribed to event ${eventId}`);
    return { event: 'subscribed', eventId };
  }

  @SubscribeMessage('unsubscribeFromEvent')
  handleUnsubscribeFromEvent(
    @MessageBody() eventId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`event-${eventId}`);
    this.logger.log(`Client ${client.id} unsubscribed from event ${eventId}`);
    return { event: 'unsubscribed', eventId };
  }

  // Call this method when a new sponsor is created
  // Call this method when a new sponsor is created
  emitNewSponsor(sponsor: Sponsor) {
    this.server.to(`event-${sponsor.eventId}`).emit('newSponsor', {
      id: sponsor.id,
      userName: sponsor.userName,
      userAvatar: sponsor.userAvatar,
      amountEUR: sponsor.amountEUR,
      badgeTier: sponsor.badgeTier,
      message: sponsor.message,
      timestamp: sponsor.createdAt,
      verified: sponsor.verified,
    });
  }

  // Emit updated stats for an event
  emitUpdatedStats(eventId: number, stats: any) {
    this.server.to(`event-${eventId}`).emit('statsUpdated', stats);
  }
}
