import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: 'notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets: Map<number, string> = new Map();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.query.token;
      if (token) {
        const payload = this.jwtService.verify(token);
        const userId = payload.sub;
        this.userSockets.set(userId, client.id);
        client.join(`user:${userId}`);
        console.log(`User ${userId} connected to notifications`);
      }
    } catch (error) {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('join:user')
  handleJoinUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: number },
  ) {
    client.join(`user:${data.userId}`);
  }

  @SubscribeMessage('join:topic')
  handleJoinTopic(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { topicId: number },
  ) {
    client.join(`topic:${data.topicId}`);
  }

  @SubscribeMessage('leave:topic')
  handleLeaveTopic(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { topicId: number },
  ) {
    client.leave(`topic:${data.topicId}`);
  }

  sendToUser(userId: number, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  sendToTopic(topicId: number, event: string, data: any) {
    this.server.to(`topic:${topicId}`).emit(event, data);
  }

  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }
}
