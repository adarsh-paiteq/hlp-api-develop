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
import { Server as SocketIOServer } from 'socket.io';
import * as dotenv from 'dotenv';
import { Logger, UseFilters, UsePipes } from '@nestjs/common';
import {
  SocketClient,
  WSAuthMiddleware,
} from '@core/middlewares/ws-auth.middleware';
import { AuthService } from '@shared/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { ChatsService } from '@chats/chats.service';
import { OnEvent } from '@nestjs/event-emitter';
import {
  NotificationCreatedEvent,
  NotificationEvent,
  VideoCallNotificationSentEvent,
} from '@notifications/notifications.event';
import { JoinChatBody } from '@chats/dto/join-chat.dto';
import { CreateChatMessageInput } from '@chats/dto/create-chat-message.dto';
import { WEBSOCKET_CLIENT_EVENT, WEBSOCKET_SERVER_EVENT } from '../constants';
import { WebsocketExceptionsFilter } from '@shared/filters/websocket.filter';
import { validationPipe } from '../../app';
import { UsersService } from '@users/users.service';
import { NotificationsService } from '@notifications/notifications.service';
import { DigidEvent, DigidSessionLogAddedEvent } from '@digid/digid.event';

dotenv.config();
const wsPort = parseInt(<string>process.env.WS_PORT);

@UseFilters(WebsocketExceptionsFilter)
@UsePipes(validationPipe)
@WebSocketGateway(wsPort, { namespace: 'ws', cors: { origin: '*' } })
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(AppGateway.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly chatsService: ChatsService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @WebSocketServer()
  private readonly server: SocketIOServer;

  afterInit(server: SocketIOServer): void {
    const authMiddleware = WSAuthMiddleware(
      this.authService,
      this.configService,
      this.logger,
    );
    server.use(authMiddleware);
    this.logger.log(`${AppGateway.name} init`);
  }

  async handleConnection(client: SocketClient): Promise<void> {
    this.logger.log(`Client id: ${client?.user?.id} connected`);
    await this.usersService.updateUserActiveStatus(
      this.server,
      client.user.id,
      true,
    );
  }

  async handleDisconnect(client: SocketClient): Promise<void> {
    this.logger.log(`Cliend id:${client?.user.id} disconnected`);
    await this.usersService.updateUserActiveStatus(
      this.server,
      client.user.id,
      false,
    );
  }

  @OnEvent(NotificationEvent.VIDEO_CALL_NOTIFICATION_SENT)
  sendVideoCallNotification(payload: VideoCallNotificationSentEvent): void {
    const { notificationPayload } = payload;
    const eventName = `video-call-notification-${notificationPayload.receiverUserId}`;
    this.server.emit(eventName, notificationPayload);
  }

  @SubscribeMessage(WEBSOCKET_SERVER_EVENT.CHATS_JOIN)
  async handleJoin(
    @MessageBody() data: JoinChatBody,
    @ConnectedSocket() client: SocketClient,
  ): Promise<void> {
    return await this.chatsService.joinChat(data, client);
  }

  @SubscribeMessage(WEBSOCKET_SERVER_EVENT.CHATS_MESSAGES)
  async handleSendChatMessage(
    @MessageBody() data: CreateChatMessageInput,
    @ConnectedSocket() client: SocketClient,
  ): Promise<void> {
    return await this.chatsService.sendChatMessage(data, client, this.server);
  }

  @OnEvent(NotificationEvent.NOTIFICATION_CREATED)
  async sendDoctortSocketNotification(
    payload: NotificationCreatedEvent,
  ): Promise<void> {
    const { userNotification } = payload;
    await this.notificationsService.sendDoctorSocketNotification(
      userNotification,
      this.server,
    );
  }

  /**@deprecated app team using getDigidLoginStatus query instead */
  @OnEvent(DigidEvent.DIGID_SESSION_LOG_ADDED)
  async handleDigidSessionLogAddedEvent(
    payload: DigidSessionLogAddedEvent,
  ): Promise<void> {
    const { userId } = payload;
    this.logger.log(
      `Emitting socket event for digid session log added: ${userId}`,
    );
    this.server.emit(WEBSOCKET_CLIENT_EVENT.USERS_DIGID_LOGIN_UPDATES(userId), {
      userId,
      isLoginCompleted: true,
    });
  }
}
