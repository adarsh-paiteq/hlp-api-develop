import { Resolver, Args, Mutation, Query } from '@nestjs/graphql';
import { Roles } from '@shared/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { UserRoles } from '../users/users.dto';
import { GetUser } from '@shared/decorators/user.decorator';
import { JwtAuthGuard } from '@shared/guards/auth.guard';
import { LoggedInUser } from '@shared/auth/jwt.strategy';
import { RolesGuard } from '@shared/guards/roles.guard';
import { CreateGroupOutput, CreateGroupInput } from './dto/create-groups.dto';
import { DeleteGroupArgs, DeleteGroupResponse } from './dto/delete-groups.dto';
import {
  SearchDoctorsArgs,
  SearchDoctorsResponse,
} from './dto/get-doctor-list.dto';
import {
  GetGroupListArgs,
  GetGroupListResponse,
} from './dto/get-group-list.dto';
import { GetUserListArgs, GetUserListResponse } from './dto/get-user-list.dto';
import {
  GetGroupOwnersArgs,
  GetGroupOwnersResponse,
} from './dto/get-group-owners.dto';

import { UpdateGroupInput, UpdateGroupResponse } from './dto/update-groups.dto';
import { LeaveGroupArgs, LeaveGroupResponse } from './dto/leave-group.dto';
import {
  RemoveGroupOwnerArgs,
  RemoveGroupOwnerResponse,
} from './dto/remove-group-owner.dto';
import { GetGroupArgs, GetGroupResponse } from './dto/get-group.dto';
import {
  AddGroupOwnerArgs,
  AddGroupOwnerResponse,
} from './dto/add-group-owner.dto';

import {
  AddGroupToolArgs,
  AddGroupToolResponse,
} from './dto/add-group-tool.dto';
import {
  RemoveGroupUserArgs,
  RemoveGroupUserResponse,
} from './dto/remove-group-user.dto';
import {
  SendGroupInvitationArgs,
  SendGroupInvitationResponse,
} from './dto/send-group-invitations.dto';
import { GroupsService } from './groups.service';
import {
  GetGroupToolArgs,
  GetGroupToolResponse,
} from './dto/get-group-tools.dto';
import {
  DeleteGroupToolArgs,
  DeleteGroupToolResponse,
} from './dto/delete-group-tool.dto';
import {
  UpdateGroupInvitationStatusInput,
  UpdateGroupInvitationStatusResponse,
} from './dto/update-group-invitation-status.dto';
import {
  AddGroupMemberArgs,
  AddGroupMemberResponse,
} from './dto/add-group-member.dto';

@Resolver()
export class GroupsResolver {
  constructor(private readonly groupsService: GroupsService) {}
  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => CreateGroupOutput, { name: 'createGroup' })
  async createGroup(
    @GetUser() doctor: LoggedInUser,
    @Args('input') input: CreateGroupInput,
  ): Promise<CreateGroupOutput> {
    return await this.groupsService.createGroup(
      doctor.id,
      input,
      doctor.organization_id,
    );
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UpdateGroupResponse, { name: 'updateGroup' })
  async updateGroup(
    @GetUser() doctor: LoggedInUser,
    @Args('input') input: UpdateGroupInput,
  ): Promise<UpdateGroupResponse> {
    return await this.groupsService.updateGroup(doctor.id, input);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => DeleteGroupResponse, { name: 'deleteGroup' })
  async deleteGroup(
    @GetUser() doctor: LoggedInUser,
    @Args() args: DeleteGroupArgs,
  ): Promise<DeleteGroupResponse> {
    return await this.groupsService.deleteGroup(doctor.id, args.groupId);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => SearchDoctorsResponse, { name: 'searchDoctors' })
  async searchDoctors(
    @GetUser() doctor: LoggedInUser,
    @Args() args: SearchDoctorsArgs,
  ): Promise<SearchDoctorsResponse> {
    return await this.groupsService.searchDoctors(doctor.id, args);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetGroupListResponse, { name: 'getGroupList' })
  async getGroupList(
    @GetUser() doctor: LoggedInUser,
    @Args() args: GetGroupListArgs,
  ): Promise<GetGroupListResponse> {
    return await this.groupsService.getGroupList(args, doctor.id);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetUserListResponse, { name: 'getUserList' })
  async getUserList(
    @GetUser() doctor: LoggedInUser,
    @Args() args: GetUserListArgs,
  ): Promise<GetUserListResponse> {
    return await this.groupsService.getUserList(doctor.id, args);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetGroupOwnersResponse, { name: 'getGroupOwners' })
  async getGroupOwners(
    @Args() args: GetGroupOwnersArgs,
  ): Promise<GetGroupOwnersResponse> {
    return await this.groupsService.getGroupOwners(args);
  }

  @Roles(UserRoles.DOCTOR, UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => LeaveGroupResponse, { name: 'leaveGroup' })
  async leaveGroup(
    @GetUser() user: LoggedInUser,
    @Args() args: LeaveGroupArgs,
  ): Promise<LeaveGroupResponse> {
    return await this.groupsService.leaveGroup(user.id, args.groupId);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => RemoveGroupOwnerResponse, { name: 'removeGroupOwner' })
  async removeGroupOwner(
    @GetUser() doctor: LoggedInUser,
    @Args() args: RemoveGroupOwnerArgs,
  ): Promise<RemoveGroupOwnerResponse> {
    const { groupId, doctorId } = args;
    return await this.groupsService.removeGroupOwner(
      doctorId,
      groupId,
      doctor.id,
    );
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetGroupResponse, { name: 'getGroup' })
  async getGroup(@Args() args: GetGroupArgs): Promise<GetGroupResponse> {
    return await this.groupsService.getGroup(args.groupId);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => AddGroupOwnerResponse, { name: 'addGroupOwner' })
  async addGroupOwner(
    @GetUser() doctor: LoggedInUser,
    @Args() args: AddGroupOwnerArgs,
  ): Promise<AddGroupOwnerResponse> {
    return await this.groupsService.addGroupOwner(
      doctor.id,
      args,
      doctor.organization_id,
    );
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => AddGroupToolResponse, { name: 'addGroupTool' })
  async addGroupTool(
    @Args() args: AddGroupToolArgs,
  ): Promise<AddGroupToolResponse> {
    const { groupId, toolKitId } = args;
    return await this.groupsService.addGroupTool(groupId, toolKitId);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => DeleteGroupToolResponse, { name: 'deleteGroupTool' })
  async deleteGroupTool(
    @GetUser() doctor: LoggedInUser,
    @Args() args: DeleteGroupToolArgs,
  ): Promise<DeleteGroupToolResponse> {
    const { groupId, toolKitId } = args;
    return await this.groupsService.deleteGroupTool(
      doctor.id,
      groupId,
      toolKitId,
    );
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => RemoveGroupUserResponse, { name: 'removeGroupUser' })
  async removeGroupUser(
    @GetUser() doctor: LoggedInUser,
    @Args() args: RemoveGroupUserArgs,
  ): Promise<RemoveGroupUserResponse> {
    const { groupId, userId } = args;
    return await this.groupsService.removeGroupUser(userId, groupId, doctor.id);
  }

  /**
   * @deprecated it will be remove because using other mutation addGroupMember.
   */

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => SendGroupInvitationResponse, {
    name: 'sendGroupInvitation',
  })
  async sendGroupInvitation(
    @GetUser() doctor: LoggedInUser,
    @Args() args: SendGroupInvitationArgs,
  ): Promise<SendGroupInvitationResponse> {
    return await this.groupsService.sendGroupInvitation(doctor.id, args);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetGroupToolResponse, { name: 'getGroupTool' })
  async getGroupTool(
    @Args() args: GetGroupToolArgs,
  ): Promise<GetGroupToolResponse> {
    return await this.groupsService.getGroupTool(args.groupId);
  }

  /**
   * @deprecated it will be remove because using other mutation addGroupMember.
   */

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UpdateGroupInvitationStatusResponse, {
    name: 'updateGroupInvitationStatus',
  })
  async updateGroupInvitationStatus(
    @GetUser() user: LoggedInUser,
    @Args('input') input: UpdateGroupInvitationStatusInput,
  ): Promise<UpdateGroupInvitationStatusResponse> {
    return await this.groupsService.updateGroupInvitationStatus(
      user.id,
      input,
      user.organization_id,
    );
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => AddGroupMemberResponse, {
    name: 'addGroupMember',
  })
  async addGroupMember(
    @GetUser() doctor: LoggedInUser,
    @Args() args: AddGroupMemberArgs,
  ): Promise<AddGroupMemberResponse> {
    return await this.groupsService.addGroupMember(
      doctor.id,
      args,
      doctor.organization_id,
    );
  }
}
