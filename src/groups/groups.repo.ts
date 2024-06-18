import { Injectable } from '@nestjs/common';
import { Database } from '@core/modules/database/database.service';
import { InsertDoctorGroup, InsertGroup } from './dto/create-groups.dto';
import { Group } from './entities/groups.entity';
import { DoctorGroup } from './entities/doctor-group.entity';
import { Doctor } from '../doctors/entities/doctors.entity';
import { UserRoles } from '../users/users.dto';
import { Users } from '../users/users.model';
import { GroupUpdateDto } from './dto/delete-groups.dto';
import { DoctorGroupUpdateDto } from './dto/update-groups.dto';
import { GroupOwners } from './dto/get-group-owners.dto';
import { Toolkit } from '../toolkits/toolkits.model';
import { ChannelTools } from './entities/channel-tools.entity';
import {
  ChannelInvitation,
  ChannelInvitationStatus,
} from './entities/channel-invitations.entity';
import { GetGroupResponse } from './dto/get-group.dto';
import { SendGroupInvitationInput } from './dto/send-group-invitations.dto';
import { GroupTool } from './dto/get-group-tools.dto';
import { UserNotification } from '@notifications/entities/user-notifications.entity';
import { UserChannel } from '@channels/entities/user-channel.entity';
import { OrganisationChannel } from '@channels/entities/organisation-channels.entity';

@Injectable()
export class GroupsRepo {
  constructor(private readonly database: Database) {}
  async getGroupByName(name: string): Promise<Group | null> {
    const query = 'SELECT * FROM channels WHERE name_id = $1';
    const [group] = await this.database.query<Group>(query, [name]);
    return group;
  }

  async createGroup(groups: InsertGroup): Promise<Group> {
    const keys = Object.keys(groups);
    const values = Object.values(groups);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');
    const query = `INSERT INTO channels (${columns}) VALUES (${placeholders}) RETURNING *;`;
    const [group] = await this.database.query<Group>(query, values);
    return group;
  }

  async createOrganisationChannel(
    organisationId: string,
    channelId: string,
  ): Promise<OrganisationChannel> {
    const query = `INSERT INTO organisation_channels (organisation_id,channel_id) VALUES($1,$2) RETURNING *; `;
    const [organisationChannel] =
      await this.database.query<OrganisationChannel>(query, [
        organisationId,
        channelId,
      ]);
    return organisationChannel;
  }

  async createDoctorsGroup(
    doctorGroup: InsertDoctorGroup,
  ): Promise<DoctorGroup> {
    const keys = Object.keys(doctorGroup);
    const values = Object.values(doctorGroup);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');
    const query = `INSERT INTO user_channels (${columns}) VALUES (${placeholders}) RETURNING *;`;
    const [savedGroup] = await this.database.query<DoctorGroup>(query, values);
    return savedGroup;
  }

  async getGroupById(id: string): Promise<Group> {
    const query =
      'SELECT * FROM channels WHERE id = $1 AND is_private = $2 AND is_deleted = $3 ';
    const [group] = await this.database.query<Group>(query, [id, true, false]);
    return group;
  }

  async searchDoctors(
    page: number,
    limit: number,
    organizationId: string,
    groupId: string,
    text?: string,
  ): Promise<{ doctors: Doctor[]; total: number }> {
    const offset = (page - 1) * limit;
    let queryWithoutPagination = `SELECT CAST(COALESCE(COUNT(*),'0') AS INTEGER) AS total
    FROM users
    WHERE
        NOT EXISTS (
            SELECT *
            FROM user_channels
            WHERE user_channels.user_id = users.id
              AND user_channels.channel_id = $1 AND user_channels.is_channel_unfollowed = false
        )
        AND users.organization_id = $2
        AND users.role = $3
        AND users.is_onboarded = true`;
    const paramsWithoutPagination: unknown[] = [
      groupId,
      organizationId,
      UserRoles.DOCTOR,
    ];
    if (text) {
      queryWithoutPagination += ` AND (first_name ILIKE $4 OR last_name ILIKE $4 OR email ILIKE $4 OR user_name ILIKE $4)`;
      paramsWithoutPagination.push(`%${text}%`);
    }

    let queryWithPagination = `SELECT  users.*
    FROM users
    WHERE
        NOT EXISTS (
            SELECT *
            FROM user_channels
            WHERE user_channels.user_id = users.id
              AND user_channels.channel_id = $1 AND user_channels.is_channel_unfollowed = false
        )
        AND users.organization_id = $2
        AND users.role = $3
        AND users.is_onboarded = true`;
    const paramsWithPagination: unknown[] = [
      groupId,
      organizationId,
      UserRoles.DOCTOR,
    ];

    if (text) {
      queryWithPagination += ` AND (first_name ILIKE $4 OR last_name ILIKE $4 OR email ILIKE $4 OR user_name ILIKE $4)
        ORDER BY created_at DESC LIMIT $5 OFFSET $6`;
      paramsWithPagination.push(`%${text}%`, limit, offset);
    } else {
      queryWithPagination += ` ORDER BY created_at DESC LIMIT $4 OFFSET $5`;
      paramsWithPagination.push(limit, offset);
    }

    const [[{ total }], doctors] = await Promise.all([
      this.database.query<{ total: number }>(
        queryWithoutPagination,
        paramsWithoutPagination,
      ),
      this.database.query<Doctor>(queryWithPagination, paramsWithPagination),
    ]);

    return { doctors, total };
  }

  async getGroupList(
    doctorId: string,
    page: number,
    limit: number,
    text?: string,
  ): Promise<{ groups: Group[]; total: number }> {
    const offset = (page - 1) * limit;
    let queryWithoutPagination = `SELECT CAST(COALESCE(COUNT(*),'0') AS INTEGER) AS total 
    FROM channels
    LEFT JOIN user_channels ON channels.id = user_channels.channel_id
    WHERE user_channels.user_id = $1 AND user_channels.is_channel_unfollowed=$2 AND channels.is_deleted=$2 AND channels.is_private=$3`;
    const paramsWithoutPagination: unknown[] = [doctorId, false, true];
    if (text) {
      queryWithoutPagination += ` AND title ILIKE $4`;
      paramsWithoutPagination.push(`%${text}%`);
    }
    let queryWithPagination = `SELECT channels.*
    FROM channels
    LEFT JOIN user_channels ON channels.id = user_channels.channel_id
    WHERE user_channels.user_id = $1 AND user_channels.is_channel_unfollowed=$2 AND channels.is_deleted=$2 AND channels.is_private=$3`;
    const paramsWithPagination: unknown[] = [doctorId, false, true];
    if (text) {
      queryWithPagination += ` AND title ILIKE $4 ORDER BY created_at DESC LIMIT $5 OFFSET $6`;
      paramsWithPagination.push(`%${text}%`, limit, offset);
    } else {
      queryWithPagination += ` ORDER BY created_at DESC LIMIT $4 OFFSET $5`;
      paramsWithPagination.push(limit, offset);
    }

    const [[{ total }], groups] = await Promise.all([
      this.database.query<{ total: number }>(
        queryWithoutPagination,
        paramsWithoutPagination,
      ),
      this.database.query<Group>(queryWithPagination, paramsWithPagination),
    ]);

    return { groups, total };
  }

  async getDoctorById(doctorId: string): Promise<Doctor | null> {
    const query = `SELECT * FROM users WHERE id = $1 `;
    const [doctor] = await this.database.query<Doctor>(query, [doctorId]);

    return doctor;
  }

  async getUserById(userId: string): Promise<Users | null> {
    const query = `SELECT * FROM users WHERE id = $1 AND role= $2`;
    const [user] = await this.database.query<Users>(query, [
      userId,
      UserRoles.USER,
    ]);
    return user;
  }

  async getUserList(
    page: number,
    limit: number,
    organizationId: string,
    groupId: string,
    text?: string,
  ): Promise<{ users: Users[]; total: number }> {
    const offset = (page - 1) * limit;
    let queryWithoutPagination = `SELECT CAST(COALESCE(COUNT(*),'0') AS INTEGER) AS total
    FROM users
    WHERE
        NOT EXISTS (
            SELECT *
            FROM user_channels
            WHERE user_channels.user_id = users.id
              AND user_channels.channel_id = $1 AND user_channels.is_channel_unfollowed = false
        )
        AND users.organization_id = $2
        AND users.role = $3
        AND users.is_onboarded = true`;
    const paramsWithoutPagination: unknown[] = [
      groupId,
      organizationId,
      UserRoles.USER,
    ];
    if (text) {
      queryWithoutPagination += ` AND (first_name ILIKE $4 OR last_name ILIKE $4 OR email ILIKE $4 OR user_name ILIKE $4)`;
      paramsWithoutPagination.push(`%${text}%`);
    }

    let queryWithPagination = `SELECT  users.*
    FROM users
    WHERE
        NOT EXISTS (
            SELECT *
            FROM user_channels
            WHERE user_channels.user_id = users.id
              AND user_channels.channel_id = $1 AND user_channels.is_channel_unfollowed = false
        )
        AND users.organization_id = $2
        AND users.role = $3
        AND users.is_onboarded = true`;
    const paramsWithPagination: unknown[] = [
      groupId,
      organizationId,
      UserRoles.USER,
    ];

    if (text) {
      queryWithPagination += ` AND (first_name ILIKE $4 OR last_name ILIKE $4 OR email ILIKE $4 OR user_name ILIKE $4)
        ORDER BY created_at DESC LIMIT $5 OFFSET $6`;
      paramsWithPagination.push(`%${text}%`, limit, offset);
    } else {
      queryWithPagination += ` ORDER BY created_at DESC LIMIT $4 OFFSET $5`;
      paramsWithPagination.push(limit, offset);
    }

    const [[{ total }], users] = await Promise.all([
      this.database.query<{ total: number }>(
        queryWithoutPagination,
        paramsWithoutPagination,
      ),
      this.database.query<Users>(queryWithPagination, paramsWithPagination),
    ]);

    return { users, total };
  }

  async updateDoctorsGroupById(
    groupId: string,
    updateDoctorGroup: DoctorGroupUpdateDto,
  ): Promise<DoctorGroup> {
    const keys = Object.keys(updateDoctorGroup);
    const values = Object.values(updateDoctorGroup);

    const setFields = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const query = `UPDATE user_channels  SET ${setFields} WHERE channel_id = $${
      keys.length + 1
    } RETURNING *;`;

    const updateValues = [...values, groupId];

    const [updatedDoctorGroup] = await this.database.query<DoctorGroup>(
      query,
      updateValues,
    );

    return updatedDoctorGroup;
  }

  async leaveGroup(userId: string, groupId: string): Promise<DoctorGroup> {
    const query = `UPDATE user_channels
    SET is_channel_unfollowed = true,
        updated_by = $1
    WHERE channel_id = $2
      AND user_id = $1 RETURNING *;`;
    const [doctor] = await this.database.query<DoctorGroup>(query, [
      userId,
      groupId,
    ]);
    return doctor;
  }

  async removeGroupOwner(
    doctorId: string,
    groupId: string,
    id: string,
  ): Promise<DoctorGroup> {
    const query = `UPDATE user_channels
    SET is_channel_unfollowed = true,
        updated_by = $3
    WHERE channel_id = $2
      AND user_id = $1 RETURNING *;`;
    const [doctor] = await this.database.query<DoctorGroup>(query, [
      doctorId,
      groupId,
      id,
    ]);
    return doctor;
  }

  async removeGroupUser(
    userId: string,
    groupId: string,
    id: string,
  ): Promise<DoctorGroup> {
    const query = `UPDATE user_channels
    SET is_channel_unfollowed = true,
        updated_by = $3
    WHERE channel_id = $2
      AND user_id = $1 RETURNING *;`;
    const [doctor] = await this.database.query<DoctorGroup>(query, [
      userId,
      groupId,
      id,
    ]);
    return doctor;
  }

  async updateGroupById(
    groupId: string,
    updates: GroupUpdateDto,
  ): Promise<Group> {
    const parameters = [...Object.values(updates), groupId];
    const query =
      'UPDATE channels SET ' +
      Object.keys(updates)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ') +
      ` WHERE id = $${parameters.length} RETURNING *;`;
    const [updatedDoctor] = await this.database.query<Group>(query, parameters);

    return updatedDoctor;
  }

  async getGroupOwners(
    page: number,
    limit: number,
    groupId: string,
    text?: string,
  ): Promise<{ groupOwners: GroupOwners[]; total: number }> {
    const offset = (page - 1) * limit;

    let queryWithoutPagination = `SELECT CAST(COALESCE(COUNT(*),'0') AS INTEGER) AS total
    FROM user_channels
    LEFT JOIN users ON users.id = user_channels.user_id
    WHERE user_channels.channel_id = $1
    AND user_channels.is_channel_unfollowed = false
    AND users.role = $2`;
    const paramsWithoutPagination: unknown[] = [groupId, UserRoles.DOCTOR];

    if (text) {
      queryWithoutPagination += ` AND (first_name ILIKE $3 OR last_name ILIKE $3 OR email ILIKE $3 OR user_name ILIKE $3)`;
      paramsWithoutPagination.push(`%${text}%`);
    }

    let queryWithPagination = `SELECT users.*
    FROM user_channels
    LEFT JOIN users ON users.id = user_channels.user_id
    WHERE user_channels.channel_id = $1
    AND user_channels.is_channel_unfollowed = false
    AND users.role = $2`;
    const paramsWithPagination: unknown[] = [groupId, UserRoles.DOCTOR];

    if (text) {
      queryWithPagination += ` AND (first_name ILIKE $3 OR last_name ILIKE $3 OR email ILIKE $3 OR user_name ILIKE $3)
      ORDER BY created_at DESC LIMIT $4 OFFSET $5`;
      paramsWithPagination.push(`%${text}%`, limit, offset);
    } else {
      queryWithPagination += ` ORDER BY created_at DESC LIMIT $3 OFFSET $4`;
      paramsWithPagination.push(limit, offset);
    }
    const [[{ total }], groupOwners] = await Promise.all([
      this.database.query<{ total: number }>(
        queryWithoutPagination,
        paramsWithoutPagination,
      ),
      this.database.query<GroupOwners>(
        queryWithPagination,
        paramsWithPagination,
      ),
    ]);
    return { groupOwners, total };
  }

  async getToolKitById(toolkitId: string): Promise<Toolkit> {
    const query = 'SELECT * FROM tool_kits WHERE id = $1';
    const [toolkit] = await this.database.query<Toolkit>(query, [toolkitId]);
    return toolkit;
  }

  async getGroupToolKit(
    groupId: string,
    toolkitId: string,
  ): Promise<ChannelTools> {
    const query =
      'SELECT * FROM channel_tools WHERE  channel_id = $1 AND tool_kit_id = $2';
    const [groupToolKit] = await this.database.query<ChannelTools>(query, [
      groupId,
      toolkitId,
    ]);
    return groupToolKit;
  }

  async addGroupToolKit(
    groupId: string,
    toolKitId: string,
  ): Promise<ChannelTools> {
    const query = `INSERT INTO channel_tools (channel_id , tool_kit_id) VALUES ($1 ,$2) RETURNING *;`;
    const [groupToolKit] = await this.database.query<ChannelTools>(query, [
      groupId,
      toolKitId,
    ]);
    return groupToolKit;
  }
  async getGroupInvitation(
    groupId: string,
    userId: string,
  ): Promise<ChannelInvitation> {
    const query =
      'SELECT * FROM channel_invitations WHERE channel_id = $1 AND user_id=$2AND status=$3';
    const [channelInvitation] = await this.database.query<ChannelInvitation>(
      query,
      [groupId, userId, ChannelInvitationStatus.PENDING],
    );
    return channelInvitation;
  }

  async getUser(userId: string): Promise<Users> {
    const query = `SELECT * FROM users WHERE id = $1 AND role=$2`;
    const [users] = await this.database.query<Users>(query, [
      userId,
      UserRoles.USER,
    ]);
    return users;
  }
  async createGroupInvitation(
    sendGroupInvitationInput: SendGroupInvitationInput,
  ): Promise<ChannelInvitation> {
    const keys = Object.keys(sendGroupInvitationInput);
    const values = Object.values(sendGroupInvitationInput);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');
    const query = `INSERT INTO channel_invitations (${columns}) VALUES (${placeholders}) RETURNING *;`;
    const [groupInvitation] = await this.database.query<ChannelInvitation>(
      query,
      values,
    );
    return groupInvitation;
  }

  async getGroup(groupId: string): Promise<GetGroupResponse> {
    const query = `SELECT
    ROW_TO_JSON(channels.*) AS group,
    COALESCE(JSON_AGG(DISTINCT users.*) FILTER (WHERE users.id IS NOT NULL AND users.role = $1), '[]') AS owners,
    COALESCE(JSON_AGG(DISTINCT users.*) FILTER (WHERE users.id IS NOT NULL AND users.role = $2), '[]') AS patients
    FROM channels
    LEFT JOIN user_channels ON user_channels.channel_id = channels.id AND user_channels.is_channel_unfollowed = false
    LEFT JOIN users ON users.id = user_channels.user_id
    WHERE channels.id = $3
    GROUP BY channels.id;`;
    const [group] = await this.database.query<GetGroupResponse>(query, [
      UserRoles.DOCTOR,
      UserRoles.USER,
      groupId,
    ]);
    return group;
  }
  async getGroupTool(groupId: string): Promise<GroupTool[]> {
    const query = `SELECT tool_kits.* AS toolkits,
    ROW_TO_JSON(membership_levels.*)AS membership_levels,
    ROW_TO_JSON(membership_stages.*)AS membership_stages
    FROM
      channel_tools
      LEFT JOIN tool_kits ON tool_kits.id = channel_tools.tool_kit_id
      LEFT JOIN membership_levels ON membership_levels.id = tool_kits.membership_level_id
       LEFT JOIN membership_stages ON membership_stages.id = tool_kits.membership_stage_id
    WHERE
      channel_tools.channel_id = $1
    GROUP BY
      channel_tools.channel_id,tool_kits.id,membership_levels.id,membership_stages.id;
    `;
    const groupTools = await this.database.query<GroupTool>(query, [groupId]);
    return groupTools;
  }

  async deleteGroupTool(
    groupId: string,
    toolKitId: string,
  ): Promise<ChannelTools> {
    const query =
      'DELETE FROM channel_tools WHERE channel_id = $1 AND tool_kit_id = $2 RETURNING *;';
    const [groupTool] = await this.database.query<ChannelTools>(query, [
      groupId,
      toolKitId,
    ]);
    return groupTool;
  }

  async getGroupInvitationById(
    invitationId: string,
  ): Promise<ChannelInvitation> {
    const query =
      'SELECT * FROM channel_invitations WHERE id = $1 AND status=$2';
    const [channelInvitation] = await this.database.query<ChannelInvitation>(
      query,
      [invitationId, ChannelInvitationStatus.PENDING],
    );
    return channelInvitation;
  }

  async updateGroupInvitationStatus(
    invitationId: string,
    status: ChannelInvitationStatus,
  ): Promise<ChannelInvitation> {
    const query = `UPDATE channel_invitations SET status=$1 WHERE id = $2 RETURNING *;`;
    const updateValues = [status, invitationId];
    const [updatedGroupInvitation] =
      await this.database.query<ChannelInvitation>(query, updateValues);
    return updatedGroupInvitation;
  }

  async updateUserNotification(
    invitationId: string,
  ): Promise<UserNotification> {
    const query =
      'UPDATE user_notifications SET is_read=$1 WHERE invitation_id = $2';
    const [group] = await this.database.query<UserNotification>(query, [
      true,
      invitationId,
    ]);
    return group;
  }

  async getUserChannel(userId: string, groupId: string): Promise<UserChannel> {
    const query =
      'SELECT * FROM user_channels WHERE channel_id = $1 AND user_id=$2 AND is_channel_unfollowed= $3';
    const [groupUser] = await this.database.query<UserChannel>(query, [
      groupId,
      userId,
      false,
    ]);
    return groupUser;
  }

  async upsertUserChannel(
    userChannel: InsertDoctorGroup,
    updated_by: string,
  ): Promise<UserChannel> {
    const keys = Object.keys(userChannel);
    const values = Object.values(userChannel);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');
    const query = `INSERT INTO user_channels (${columns}) VALUES (${placeholders}) 
    ON CONFLICT(user_id, channel_id)
    DO UPDATE SET is_channel_unfollowed = false, updated_by = $${
      values.length + 1
    }
    RETURNING *;`;
    const [savedUserChannel] = await this.database.query<UserChannel>(query, [
      ...values,
      updated_by,
    ]);
    return savedUserChannel;
  }
}
