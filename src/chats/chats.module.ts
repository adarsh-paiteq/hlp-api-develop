import { Module, forwardRef } from '@nestjs/common';
import { ChatsResolver } from './chats.resolver';
import { ChatsQueue, registerChatsQueue } from './chats.queue';
import { ChatsController } from './chats.controller';
import { ChatsListener } from './chats.listener';
import { ChatsProcessor } from './chats.processor';
import { ChannelsModule } from '@channels/channels.module';
import { AuthModule } from '@shared/auth/auth.module';
import { ChatsService } from './chats.service';
import { ChatsRepo } from './chats.repo';
import { UsersModule } from '@users/users.module';

@Module({
  imports: [
    registerChatsQueue,
    AuthModule,
    ChannelsModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [ChatsController],
  providers: [
    ChatsResolver,
    ChatsService,
    ChatsRepo,
    ChatsListener,
    ChatsProcessor,
    ChatsQueue,
  ],
  exports: [registerChatsQueue, ChatsService, ChatsRepo],
})
export class ChatsModule {}
