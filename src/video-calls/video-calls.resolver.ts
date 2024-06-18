import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Roles } from '@shared/decorators/roles.decorator';
import { UserRoles } from '../users/users.dto';
import { UseGuards } from '@nestjs/common';
import { LoggedInUser } from '@shared/auth/jwt.strategy';
import { GetUser } from '@shared/decorators/user.decorator';
import { JwtAuthGuard } from '@shared/guards/auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { VideoCallsService } from './video-calls.service';
import {
  GenerateVideoCallTokenArgs,
  GenerateVideoCallTokenResponse,
} from './dto/generate-video-call-token.dto';
import {
  StartVideoCallArgs,
  StartVideoCallResponse,
} from './dto/start-video-call.dto';

@Resolver()
export class VideoCallsResolver {
  constructor(private readonly videoCallsService: VideoCallsService) {}

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => GenerateVideoCallTokenResponse, {
    name: 'generateVideoCallToken',
    description: 'Used to generate the jitsi video call token',
  })
  async generateVideoCallToken(
    @GetUser() user: LoggedInUser,
    @Args() args: GenerateVideoCallTokenArgs,
  ): Promise<GenerateVideoCallTokenResponse> {
    return this.videoCallsService.generateVideoCallToken(
      user.id,
      args.receiver_user_id,
    );
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => GenerateVideoCallTokenResponse, {
    name: 'generateTestVideoCallToken',
    description: 'Used to generate the Test jitsi video call token',
  })
  async generateTestVideoCallToken(
    @GetUser() user: LoggedInUser,
    @Args() args: GenerateVideoCallTokenArgs,
  ): Promise<GenerateVideoCallTokenResponse> {
    return this.videoCallsService.generateTestVideoCallToken(
      user.id,
      args.receiver_user_id,
    );
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => StartVideoCallResponse, {
    name: 'startVideoCall',
    description: 'Used to generate the jitsi video call token',
  })
  async startVideoCall(
    @GetUser() user: LoggedInUser,
    @Args() args: StartVideoCallArgs,
  ): Promise<StartVideoCallResponse> {
    return await this.videoCallsService.startVideoCall(user.id, args);
  }
}
