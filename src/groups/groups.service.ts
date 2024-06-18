import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateGroupOutput,
  CreateGroupInput,
  InsertDoctorGroup,
  InsertGroup,
} from './dto/create-groups.dto';
import { TranslationService } from '@shared/services/translation/translation.service';
import { DeleteGroupResponse } from './dto/delete-groups.dto';
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

import { LeaveGroupResponse } from './dto/leave-group.dto';
import { GetGroupResponse } from './dto/get-group.dto';
import {
  AddDoctorOwnerGroup,
  AddGroupOwnerArgs,
  AddGroupOwnerResponse,
} from './dto/add-group-owner.dto';
import {
  UpdateGroup,
  UpdateGroupInput,
  UpdateGroupResponse,
} from './dto/update-groups.dto';
import { AddGroupToolResponse } from './dto/add-group-tool.dto';
import { GroupsRepo } from './groups.repo';
import { DeleteGroupToolResponse } from './dto/delete-group-tool.dto';
import { RemoveGroupUserResponse } from './dto/remove-group-user.dto';
import {
  SendGroupInvitationArgs,
  SendGroupInvitationInput,
  SendGroupInvitationResponse,
} from './dto/send-group-invitations.dto';
import {
  GroupCreatedEvent,
  GroupDeletedEvent,
  GroupMemberAddedEvent,
  GroupOwnerAddedEvent,
  GroupsEvent,
  groupInvitationCreatedEvent,
} from './groups.events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChannelInvitationStatus } from './entities/channel-invitations.entity';
import { GetGroupToolResponse } from './dto/get-group-tools.dto';
import {
  AddUserGroup,
  UpdateGroupInvitationStatusInput,
  UpdateGroupInvitationStatusResponse,
} from './dto/update-group-invitation-status.dto';
import {
  ChannelFollowedEvent,
  ChannelUnfollowedEvent,
  ChannelsEvent,
} from '@channels/channels.event';
import {
  AddGroupMemberArgs,
  AddGroupMemberResponse,
} from './dto/add-group-member.dto';

@Injectable()
export class GroupsService {
  private readonly logger = new Logger(GroupsService.name);
  constructor(
    private readonly groupsRepo: GroupsRepo,
    private readonly translationService: TranslationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createGroup(
    doctorId: string,
    args: CreateGroupInput,
    organisationId?: string,
  ): Promise<CreateGroupOutput> {
    if (!organisationId) {
      throw new NotFoundException(`groups.organisation_not_found`);
    }
    const { title, description, image_file_path, image_id, image_url } = args;
    const modifiedTitle = title.replace(/\s/g, '').toLowerCase();
    const group = await this.groupsRepo.getGroupByName(modifiedTitle);
    if (group) {
      throw new BadRequestException(
        `groups.group_already_exist_with_this_name`,
      );
    }

    const insertGroup: InsertGroup = {
      title,
      description,
      created_by: doctorId,
      updated_by: doctorId,
      is_deleted: false,
      name_id: modifiedTitle,
      short_description: description,
      total_followers: 0,
      default_channel: false,
      is_private: true,
    };

    if (image_file_path && image_id && image_url) {
      insertGroup.image_file_path = image_file_path;
      insertGroup.image_id = image_id;
      insertGroup.image_url = image_url;
    }

    const createdGroup = await this.groupsRepo.createGroup(insertGroup);
    const { id: channelId } = createdGroup;
    await this.groupsRepo.createOrganisationChannel(organisationId, channelId);
    this.eventEmitter.emit(
      GroupsEvent.GROUP_CREATED,
      new GroupCreatedEvent(createdGroup),
    );

    const insertDoctorGroup: InsertDoctorGroup = {
      user_id: doctorId,
      channel_id: createdGroup.id,
      is_owner: true,
      created_by: doctorId,
      updated_by: doctorId,
      is_channel_unfollowed: false,
      organisation_id: organisationId,
    };

    const createdDoctorGroup = await this.groupsRepo.createDoctorsGroup(
      insertDoctorGroup,
    );

    this.eventEmitter.emit(
      ChannelsEvent.CHANNEL_FOLLOWED,
      new ChannelFollowedEvent(createdDoctorGroup),
    );
    return {
      message: this.translationService.translate(`groups.group_created`),
    };
  }

  async updateGroup(
    doctorId: string,
    args: UpdateGroupInput,
  ): Promise<UpdateGroupResponse> {
    const { groupId, group: groupArgs } = args;
    const group = await this.groupsRepo.getGroupById(groupId);
    if (!group) {
      throw new NotFoundException(`groups.group_not_found`);
    }
    const { title, description } = groupArgs;
    const modifiedTitle = title?.replace(/\s/g, '').toLowerCase();
    if (modifiedTitle !== group.name_id) {
      const groupTitle = await this.groupsRepo.getGroupByName(
        modifiedTitle as string,
      );
      if (groupTitle) {
        throw new BadRequestException(
          `groups.group_already_exist_with_this_name`,
        );
      }
    }
    const updateGroup: UpdateGroup = {
      ...args.group,
      updated_by: doctorId,
      name_id: modifiedTitle ? modifiedTitle : group.name_id,
      short_description: description ? description : group.short_description,
    };
    await this.groupsRepo.updateGroupById(groupId, updateGroup);
    await this.groupsRepo.updateDoctorsGroupById(groupId, {
      updated_by: doctorId,
    });
    return {
      message: this.translationService.translate(`groups.group_updated`),
    };
  }

  async deleteGroup(
    doctorId: string,
    groupId: string,
  ): Promise<DeleteGroupResponse> {
    const [userChannel, group] = await Promise.all([
      this.groupsRepo.getUserChannel(doctorId, groupId),
      this.groupsRepo.getGroupById(groupId),
    ]);
    if (!userChannel) {
      throw new BadRequestException(
        `groups.you_do_not_have_access_to_do_this_operation`,
      );
    }
    if (!group) {
      throw new NotFoundException(`groups.group_not_found`);
    }
    const deletedGroup = await this.groupsRepo.updateGroupById(groupId, {
      updated_by: doctorId,
      is_deleted: true,
    });

    this.eventEmitter.emit(
      GroupsEvent.GROUP_DELETED,
      new GroupDeletedEvent(deletedGroup),
    );
    return {
      message: this.translationService.translate(`groups.group_deleted`),
    };
  }

  async searchDoctors(
    doctorId: string,
    args: SearchDoctorsArgs,
  ): Promise<SearchDoctorsResponse> {
    const { text, page, limit, groupId } = args;
    const doctor = await this.groupsRepo.getDoctorById(doctorId);
    if (!doctor) {
      throw new NotFoundException(`doctors.doctor_not_found`);
    }
    const { organization_id } = doctor;
    const { doctors, total } = await this.groupsRepo.searchDoctors(
      page,
      limit,
      organization_id,
      groupId,
      text,
    );
    const total_pages = Math.ceil(total / limit);
    return {
      total: total,
      totalPage: total_pages,
      page: page,
      limit: limit,
      doctors: doctors,
    };
  }

  async getGroupList(
    args: GetGroupListArgs,
    doctorId: string,
  ): Promise<GetGroupListResponse> {
    const { text, page, limit } = args;
    const { groups, total } = await this.groupsRepo.getGroupList(
      doctorId,
      page,
      limit,
      text,
    );
    const total_pages = Math.ceil(total / limit);
    return {
      total: total,
      totalPage: total_pages,
      page: page,
      limit: limit,
      groups: groups,
    };
  }

  async getUserList(
    doctorId: string,
    args: GetUserListArgs,
  ): Promise<GetUserListResponse> {
    const { text, page, limit, groupId } = args;
    const doctor = await this.groupsRepo.getDoctorById(doctorId);
    if (!doctor) {
      throw new NotFoundException(`doctors.doctor_not_found`);
    }
    const { organization_id } = doctor;
    const { users, total } = await this.groupsRepo.getUserList(
      page,
      limit,
      organization_id,
      groupId,
      text,
    );
    const total_pages = Math.ceil(total / limit);
    return {
      total: total,
      totalPage: total_pages,
      page: page,
      limit: limit,
      users: users,
    };
  }

  async getGroupOwners(
    args: GetGroupOwnersArgs,
  ): Promise<GetGroupOwnersResponse> {
    const { text, page, limit, groupId } = args;
    const { groupOwners, total } = await this.groupsRepo.getGroupOwners(
      page,
      limit,
      groupId,
      text,
    );
    const total_pages = Math.ceil(total / limit);
    return {
      total: total,
      totalPage: total_pages,
      page: page,
      limit: limit,
      groupOwners: groupOwners,
    };
  }

  async leaveGroup(
    userId: string,
    groupId: string,
  ): Promise<LeaveGroupResponse> {
    const userGroup = await this.groupsRepo.getUserChannel(userId, groupId);
    if (!userGroup) {
      throw new NotFoundException(`groups.group_not_found`);
    }
    const userChannel = await this.groupsRepo.leaveGroup(userId, groupId);
    this.eventEmitter.emit(
      ChannelsEvent.CHANNEL_UNFOLLOWED,
      new ChannelUnfollowedEvent(userChannel),
    );
    return {
      message: `${this.translationService.translate(
        'groups.group_leaved_successfully',
      )}`,
    };
  }

  async removeGroupOwner(
    doctorId: string,
    groupId: string,
    id: string,
  ): Promise<LeaveGroupResponse> {
    const doctor = await this.groupsRepo.getDoctorById(doctorId);
    if (!doctor) {
      throw new NotFoundException(`doctors.doctor_not_found`);
    }
    const group = await this.groupsRepo.getGroupById(groupId);
    if (!group) {
      throw new NotFoundException(`groups.group_not_found`);
    }
    const userChannel = await this.groupsRepo.removeGroupOwner(
      doctorId,
      groupId,
      id,
    );
    this.eventEmitter.emit(
      ChannelsEvent.CHANNEL_UNFOLLOWED,
      new ChannelUnfollowedEvent(userChannel),
    );
    return {
      message: `${this.translationService.translate(
        'groups.owner_removed_successfully',
      )}`,
    };
  }

  async getGroup(groupId: string): Promise<GetGroupResponse> {
    const group = await this.groupsRepo.getGroupById(groupId);
    if (!group) {
      throw new NotFoundException(`groups.group_not_found`);
    }
    const groups = await this.groupsRepo.getGroup(groupId);
    return groups;
  }

  async addGroupOwner(
    doctorId: string,
    args: AddGroupOwnerArgs,
    organisationId?: string,
  ): Promise<AddGroupOwnerResponse> {
    if (!organisationId) {
      throw new NotFoundException(`groups.organisation_not_found`);
    }
    const { groupId, doctorId: id } = args;
    const group = await this.groupsRepo.getGroupById(groupId);
    if (!group) {
      throw new NotFoundException(`groups.group_not_found`);
    }
    const addDoctorOwnerData: AddDoctorOwnerGroup = {
      user_id: id,
      channel_id: groupId,
      is_owner: true,
      created_by: doctorId,
      updated_by: doctorId,
      is_channel_unfollowed: false,
      organisation_id: organisationId,
    };
    const userChannel = await this.groupsRepo.upsertUserChannel(
      addDoctorOwnerData,
      addDoctorOwnerData.updated_by,
    );
    this.eventEmitter.emit(
      ChannelsEvent.CHANNEL_FOLLOWED,
      new ChannelFollowedEvent(userChannel),
    );
    this.eventEmitter.emit(
      GroupsEvent.GROUP_OWNER_ADDED,
      new GroupOwnerAddedEvent(userChannel),
    );
    return {
      message: this.translationService.translate(
        `groups.doctor_group_owner_created`,
      ),
    };
  }

  async addGroupTool(
    groupId: string,
    toolKitId: string,
  ): Promise<AddGroupToolResponse> {
    const group = await this.groupsRepo.getGroupById(groupId);
    if (!group) {
      throw new NotFoundException('groups.group_not_found');
    }
    const toolkit = await this.groupsRepo.getToolKitById(toolKitId);
    if (!toolkit) {
      throw new NotFoundException('toolkits.toolkit_not_found');
    }
    const isToolKitAlreadyAdded = await this.groupsRepo.getGroupToolKit(
      groupId,
      toolKitId,
    );
    if (isToolKitAlreadyAdded) {
      throw new BadRequestException('toolkits.toolkit_already_added');
    }
    const groupToolkit = await this.groupsRepo.addGroupToolKit(
      groupId,
      toolKitId,
    );
    return groupToolkit;
  }

  async deleteGroupTool(
    doctorId: string,
    groupId: string,
    toolKitId: string,
  ): Promise<DeleteGroupToolResponse> {
    const userChannel = await this.groupsRepo.getUserChannel(doctorId, groupId);
    if (!userChannel) {
      throw new BadRequestException(
        `groups.you_do_not_have_access_to_do_this_operation`,
      );
    }
    const group = await this.groupsRepo.getGroupById(groupId);
    if (!group) {
      throw new NotFoundException('groups.group_not_found');
    }
    const toolkit = await this.groupsRepo.getToolKitById(toolKitId);
    if (!toolkit) {
      throw new NotFoundException('toolkits.toolkit_not_found');
    }
    await this.groupsRepo.deleteGroupTool(groupId, toolKitId);
    return {
      message: `${this.translationService.translate(
        'groups.tool_deleted_from_group_successfully',
      )}`,
    };
  }

  async removeGroupUser(
    userId: string,
    groupId: string,
    id: string,
  ): Promise<RemoveGroupUserResponse> {
    const user = await this.groupsRepo.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`users.user_not_found`);
    }
    const group = await this.groupsRepo.getGroupById(groupId);
    if (!group) {
      throw new NotFoundException(`groups.group_not_found`);
    }
    await this.groupsRepo.removeGroupUser(userId, groupId, id);
    return {
      message: `${this.translationService.translate(
        'groups.user_removed_successfully',
      )}`,
    };
  }

  /**
   * @deprecated it will be remove because using other mutation addGroupMember.
   */

  async sendGroupInvitation(
    doctorId: string,
    args: SendGroupInvitationArgs,
  ): Promise<SendGroupInvitationResponse> {
    const { groupId, userId } = args;
    const [group, user, userExist, groupInvitation] = await Promise.all([
      this.groupsRepo.getGroupById(groupId),
      this.groupsRepo.getUser(userId),
      this.groupsRepo.getUserChannel(userId, groupId),
      this.groupsRepo.getGroupInvitation(groupId, userId),
    ]);
    if (!group) {
      throw new NotFoundException(`groups.group_not_found`);
    }
    if (!user) {
      throw new NotFoundException(`users.user_not_found`);
    }
    if (userExist) {
      throw new BadRequestException(`groups.user_already_group`);
    }
    if (groupInvitation) {
      throw new NotFoundException(`groups.already_sent_inviation`);
    }
    const sendGroupInvitationInput: SendGroupInvitationInput = {
      user_id: user.id,
      channel_id: groupId,
      status: ChannelInvitationStatus.PENDING,
      doctor_id: doctorId,
    };
    const groupInvitationResponse = await this.groupsRepo.createGroupInvitation(
      sendGroupInvitationInput,
    );
    this.eventEmitter.emit(
      GroupsEvent.GROUP_INVITATION_CREATED,
      new groupInvitationCreatedEvent(groupInvitationResponse),
    );
    return {
      message: this.translationService.translate(`groups.invitation_sent`),
    };
  }

  async getGroupTool(groupId: string): Promise<GetGroupToolResponse> {
    const group = await this.groupsRepo.getGroupById(groupId);
    if (!group) {
      throw new NotFoundException(`groups.group_not_found`);
    }
    const groupTools = await this.groupsRepo.getGroupTool(groupId);
    return { group_tools: groupTools };
  }

  /**
   * @deprecated it will be remove because using other mutation addGroupMember.
   */

  async updateGroupInvitationStatus(
    userId: string,
    input: UpdateGroupInvitationStatusInput,
    organisationId?: string,
  ): Promise<UpdateGroupInvitationStatusResponse> {
    if (!organisationId) {
      throw new NotFoundException(`groups.organisation_not_found`);
    }
    const { invitationId, status } = input;
    const groupInvitation = await this.groupsRepo.getGroupInvitationById(
      invitationId,
    );
    if (!groupInvitation) {
      throw new NotFoundException(`invitations.invitation_not_found`);
    }
    const {
      status: channelStatus,
      channel_id: channelId,
      doctor_id: doctorId,
    } = groupInvitation;
    if (status === channelStatus) {
      throw new BadRequestException(`invitations.invalid_status`);
    }
    const [updatedGroupStatus] = await Promise.all([
      await this.groupsRepo.updateGroupInvitationStatus(invitationId, status),
      await this.groupsRepo.updateUserNotification(invitationId),
    ]);
    const { status: updateStatus } = updatedGroupStatus;

    if (updateStatus === ChannelInvitationStatus.ACCEPTED) {
      const addUserGroupData: AddUserGroup = {
        user_id: userId,
        channel_id: channelId,
        is_owner: false,
        created_by: doctorId,
        updated_by: doctorId,
        is_channel_unfollowed: false,
        organisation_id: organisationId,
      };
      const createdUserGroup = await this.groupsRepo.upsertUserChannel(
        addUserGroupData,
        addUserGroupData.updated_by,
      );

      this.eventEmitter.emit(
        ChannelsEvent.CHANNEL_FOLLOWED,
        new ChannelFollowedEvent(createdUserGroup),
      );
    }
    return {
      message: this.translationService.translate(`invitations.status_updated`),
    };
  }

  async addGroupMember(
    doctorId: string,
    args: AddGroupMemberArgs,
    organisationId?: string,
  ): Promise<AddGroupMemberResponse> {
    if (!organisationId) {
      throw new NotFoundException(`groups.organisation_not_found`);
    }
    const { groupId, userId } = args;
    const [group, user, userExist] = await Promise.all([
      this.groupsRepo.getGroupById(groupId),
      this.groupsRepo.getUser(userId),
      this.groupsRepo.getUserChannel(userId, groupId),
    ]);
    if (!group) {
      throw new NotFoundException(`groups.group_not_found`);
    }
    if (!user) {
      throw new NotFoundException(`users.user_not_found`);
    }
    if (userExist) {
      throw new BadRequestException(`groups.user_already_group`);
    }
    const addUserGroupData: AddUserGroup = {
      user_id: userId,
      channel_id: groupId,
      is_owner: false,
      created_by: doctorId,
      updated_by: doctorId,
      is_channel_unfollowed: false,
      organisation_id: organisationId,
    };
    const createdUserGroup = await this.groupsRepo.upsertUserChannel(
      addUserGroupData,
      addUserGroupData.updated_by,
    );

    this.eventEmitter.emit(
      ChannelsEvent.CHANNEL_FOLLOWED,
      new ChannelFollowedEvent(createdUserGroup),
    );
    this.eventEmitter.emit(
      GroupsEvent.GROUP_MEMBER_ADDED,
      new GroupMemberAddedEvent(createdUserGroup),
    );

    return {
      message: this.translationService.translate(`groups.add_group_member`),
    };
  }
}
