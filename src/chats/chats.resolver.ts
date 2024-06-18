import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ChatsService } from './chats.service';
import { Roles } from '@shared/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { UserRoles } from '@users/users.dto';
import { JwtAuthGuard } from '@shared/guards/auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { GetUser } from '@shared/decorators/user.decorator';
import { LoggedInUser } from '@shared/auth/jwt.strategy';
import { StartChatArgs, StartChatResponse } from './dto/start-chat.dto';
import { GetChatArgs, GetChatResponse } from './dto/get-chat.dto';
import {
  CreateChatMessageInput,
  CreateChatMessageResponse,
} from './dto/create-chat-message.dto';
import {
  GetChatMessagesArgs,
  GetChatMessagesResponse,
} from './dto/get-chat-messages.dto';
import {
  UpdateArchivedUnarchiveStatusArgs,
  UpdateUserChatArchiveStatusRes,
} from './dto/archive-unarchive-chat.dto';
import { GetChatListResponse, GetChatListArgs } from './dto/get-chat-list.dto';
import {
  DeleteUserChatArgs,
  DeleteUserChatRes,
} from './dto/delete-user-chat.dto';

@Resolver()
export class ChatsResolver {
  constructor(private readonly chatsService: ChatsService) {}

  @Mutation(() => StartChatResponse, {
    name: 'startChat',
  })
  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async startChat(
    @GetUser() user: LoggedInUser,
    @Args() args: StartChatArgs,
  ): Promise<StartChatResponse> {
    return this.chatsService.startChat(user.id, args);
  }

  @Query(() => GetChatResponse, {
    name: 'getChat',
  })
  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getChat(
    @GetUser() user: LoggedInUser,
    @Args() args: GetChatArgs,
  ): Promise<GetChatResponse> {
    return this.chatsService.getChat(user.id, args);
  }

  @Mutation(() => CreateChatMessageResponse, {
    name: 'createChatMessage',
  })
  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createChatMessage(
    @GetUser() user: LoggedInUser,
    @Args('input') input: CreateChatMessageInput,
  ): Promise<CreateChatMessageResponse> {
    return this.chatsService.createChatMessage(user.id, input);
  }

  @Query(() => GetChatMessagesResponse, {
    name: 'getChatMessages',
  })
  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getChatMessages(
    @Args() args: GetChatMessagesArgs,
  ): Promise<GetChatMessagesResponse> {
    return await this.chatsService.getChatMessages(args);
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UpdateUserChatArchiveStatusRes, {
    name: 'updateUserChatArchiveStatus',
  })
  async updateUserChatArchiveStatus(
    @GetUser() user: LoggedInUser,
    @Args() args: UpdateArchivedUnarchiveStatusArgs,
  ): Promise<UpdateUserChatArchiveStatusRes> {
    return await this.chatsService.updateUserChatArchiveStatus(
      user.id,
      args,
      user.role,
    );
  }

  @Query(() => GetChatListResponse, {
    name: 'getChatList',
  })
  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getChatList(
    @GetUser() user: LoggedInUser,
    @Args() args: GetChatListArgs,
  ): Promise<GetChatListResponse> {
    return this.chatsService.getChatList(user.id, args);
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => DeleteUserChatRes, {
    name: 'deleteUserChat',
  })
  async deleteUserChat(
    @GetUser() user: LoggedInUser,
    @Args() args: DeleteUserChatArgs,
  ): Promise<DeleteUserChatRes> {
    return await this.chatsService.deleteUserChat(user.id, args);
  }
}
