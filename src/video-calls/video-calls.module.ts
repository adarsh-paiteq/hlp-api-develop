import { Module } from '@nestjs/common';
import { VideoCallsController } from './video-calls.controller';
import { VideoCallsService } from './video-calls.service';
import { VideoCallsRepo } from './video-calls.repo';
import { VideoCallsResolver } from './video-calls.resolver';
import { AuthModule } from '@shared/auth/auth.module';
import { VideoCallsListener } from './video-calls.listener';
import { VideoCallsQueue, registerVideoCallsQueue } from './video-calls.queue';
import { VideoCallsProcessor } from './video-calls.processor';
import { ChatsModule } from '@chats/chats.module';

@Module({
  imports: [registerVideoCallsQueue, AuthModule, ChatsModule],
  controllers: [VideoCallsController],
  providers: [
    VideoCallsService,
    VideoCallsRepo,
    VideoCallsResolver,
    VideoCallsListener,
    VideoCallsQueue,
    VideoCallsProcessor,
  ],
  exports: [registerVideoCallsQueue, VideoCallsRepo, VideoCallsService],
})
export class VideoCallsModule {}
