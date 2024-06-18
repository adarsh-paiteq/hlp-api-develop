import { Resolver, Args, Mutation, Query } from '@nestjs/graphql';
import { Roles } from '@shared/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@shared/guards/auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import { AddTreatmentArgs, TreatmentResponse } from './dto/add-treatment.dto';
import { GetUser } from '@shared/decorators/user.decorator';
import { LoggedInUser } from '@shared/auth/jwt.strategy';
import {
  JoinTreatmentArgs,
  JoinTreatmentResponse,
} from './dto/join-treatment.dto';
import {
  DeleteDoctorTreatmentArgs,
  DeleteTreatmentResponse,
} from './dto/delete-treatment.dto';
import {
  UpdateTreatmentArchiveStatusArgs,
  UpdateTreatmentArchiveStatusResponse,
} from './dto/update-archive-treatment-status.dto';
import {
  RemoveDoctorTreatmentArgs,
  RemoveDoctorTreatmentResponse,
} from './dto/remove-doctor-treatment.dto';
import {
  GetTreatmentTeamArgs,
  GetTreatmentTeamResponse,
} from './dto/get-treatment-team.dto';
import {
  AddTreatmentBuddyArgs,
  AddTreatmentBuddyResponse,
} from './dto/add-treatment-buddy.dto';
import {
  GetUnassignedTreatmentDoctorsArgs,
  GetUnassignedTreatmentDoctorsResponse,
} from './dto/get-unassigned-treatment-doctors.dto';
import {
  RemoveTreatmentBuddyArgs,
  RemoveTreatmentBuddyResponse,
} from './dto/delete-treatment-buddy.dto';
import {
  GetUnassignedTreatmentBuddiesArgs,
  GetUnassignedTreatmentBuddiesResponse,
} from './dto/get-treatment-buddies-list.dto';
import {
  AddDoctorTreatmentArgs,
  AddDoctorTreatmentResponse,
} from './dto/add-doctor-treatment.dto';
import { TreatmentsService } from './treatments.service';
import {
  ChangeCoachRoleArgs,
  ChangeCoachRoleResponse,
} from './dto/change-coach-role.dto';
import {
  GetDoctorTreatmentArgs,
  GetDoctorTreatmentResponse,
} from './dto/get-doctor-treatment.dto';
import {
  UpdateTreatmentComplaintInput,
  UpdateTreatmentComplaintResponse,
} from './dto/update-treatment-complaints.dto';

import { GetTreatmentComplaintsListResponse } from './dto/treatment_complaints-list.dto';
import { I18nNextLanguage } from '@shared/decorators/language.decorator';
import {
  GetTreatmentProfileArgs,
  GetTreatmentProfileResponse,
} from './dto/get-user-treatment-profile.dto';
import { GetUserTreatmentTeamResponse } from './dto/get-user-treatment-team.dto';
import {
  GetUserUnassignedTreatmentBuddiesArgs,
  GetUserUnassignedTreatmentBuddiesResponse,
} from './dto/get-user-treatment-buddies-list.dto';
import { GetUserTreatmentProfileResponse } from './dto/get-treatment-profile.dto';
import {
  GetAppointmentDoctorListArgs,
  GetAppointmentDoctorListResponse,
} from './dto/get-treatment-doctor-list.dto';
import {
  GetDoctorPatientListArgs,
  GetDoctorPatientListResponse,
} from './dto/get-doctor-patients-list.dto';
import {
  CloseTreatmentArgs,
  CloseTreatmentResponse,
} from './dto/close-treatment.dto';
import {
  UpdateTreatmentUserProfileInput,
  UpdateTreatmentUserProfileResponse,
} from './dto/update-treatment-user-profile.dto';
import {
  SendTreatmentFileEmailArgs,
  SendTreatmentFileEmailResponse,
} from './dto/send-treatment-file-email.dto';
import { ActiveTreatmentResponse } from './dto/active-treatment.dto';

@Resolver()
export class TreatmentsResolver {
  constructor(private readonly treatmentsService: TreatmentsService) {}
  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => TreatmentResponse, { name: 'addTreatment' })
  async addTreatment(
    @GetUser() doctor: LoggedInUser,
    @Args() args: AddTreatmentArgs,
  ): Promise<TreatmentResponse> {
    return await this.treatmentsService.addTreatment(doctor.id, args);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => JoinTreatmentResponse, { name: 'joinTreatment' })
  async joinTreatment(
    @GetUser() doctor: LoggedInUser,
    @Args() args: JoinTreatmentArgs,
  ): Promise<JoinTreatmentResponse> {
    return await this.treatmentsService.joinTreatment(doctor.id, args);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => DeleteTreatmentResponse, { name: 'deleteTreatment' })
  async deleteTreatment(
    @GetUser() doctor: LoggedInUser,
    @Args() args: DeleteDoctorTreatmentArgs,
  ): Promise<DeleteTreatmentResponse> {
    return await this.treatmentsService.deleteTreatment(
      args.doctorTreatmentId,
      doctor.id,
    );
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UpdateTreatmentArchiveStatusResponse, {
    name: 'updateTreatmentArchiveStatus',
  })
  async updateTreatmentArchiveStatus(
    @GetUser() doctor: LoggedInUser,
    @Args() args: UpdateTreatmentArchiveStatusArgs,
  ): Promise<UpdateTreatmentArchiveStatusResponse> {
    return await this.treatmentsService.updateTreatmentArchiveStatus(
      args,
      doctor.id,
    );
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => RemoveDoctorTreatmentResponse, {
    name: 'removeDoctorTreatment',
  })
  async removeDoctorTreatment(
    @GetUser() doctor: LoggedInUser,
    @Args() args: RemoveDoctorTreatmentArgs,
  ): Promise<RemoveDoctorTreatmentResponse> {
    return await this.treatmentsService.removeDoctorTreatment(doctor.id, args);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetTreatmentTeamResponse, { name: 'getTreatmentTeam' })
  async getTreatmentTeam(
    @Args() args: GetTreatmentTeamArgs,
  ): Promise<GetTreatmentTeamResponse> {
    return await this.treatmentsService.getTreatmentTeam(args.treatmentId);
  }

  @Roles(UserRoles.DOCTOR, UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => AddTreatmentBuddyResponse, { name: 'addTreatmentBuddy' })
  async addTreatmentBuddy(
    @GetUser() user: LoggedInUser,
    @Args() args: AddTreatmentBuddyArgs,
  ): Promise<AddTreatmentBuddyResponse> {
    const { treatmentId, buddyId } = args;
    return await this.treatmentsService.addTreatmentBuddy(
      user.id,
      treatmentId,
      buddyId,
    );
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetUnassignedTreatmentDoctorsResponse, {
    name: 'getUnassignedTreatmentDoctors',
  })
  async getUnassignedTreatmentDoctors(
    @GetUser() doctor: LoggedInUser,
    @Args() args: GetUnassignedTreatmentDoctorsArgs,
  ): Promise<GetUnassignedTreatmentDoctorsResponse> {
    return await this.treatmentsService.getUnassignedTreatmentDoctors(
      doctor.id,
      args,
    );
  }

  @Roles(UserRoles.DOCTOR, UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => RemoveTreatmentBuddyResponse, {
    name: 'removeTreatmentBuddy',
  })
  async removeTreatmentBuddy(
    @Args() args: RemoveTreatmentBuddyArgs,
  ): Promise<RemoveTreatmentBuddyResponse> {
    const { buddyId, treatmentId } = args;
    return await this.treatmentsService.removeTreatmentBuddy(
      treatmentId,
      buddyId,
    );
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetUnassignedTreatmentBuddiesResponse, {
    name: 'getUnassignedTreatmentBuddies',
  })
  async getUnassignedTreatmentBuddies(
    @Args() args: GetUnassignedTreatmentBuddiesArgs,
  ): Promise<GetUnassignedTreatmentBuddiesResponse> {
    return await this.treatmentsService.getUnassignedTreatmentBuddies(args);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => AddDoctorTreatmentResponse, { name: 'addDoctorTreatment' })
  async addDoctorTreatment(
    @GetUser() doctor: LoggedInUser,
    @Args() args: AddDoctorTreatmentArgs,
  ): Promise<AddDoctorTreatmentResponse> {
    return await this.treatmentsService.addDoctorTreatment(doctor.id, args);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => ChangeCoachRoleResponse, { name: 'changeCoachRole' })
  async changeCoachRole(
    @GetUser() doctor: LoggedInUser,
    @Args() args: ChangeCoachRoleArgs,
  ): Promise<ChangeCoachRoleResponse> {
    return await this.treatmentsService.changeCoachRole(doctor.id, args);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetDoctorTreatmentResponse, { name: 'getDoctorTreatment' })
  async getDoctorTreatment(
    @Args() args: GetDoctorTreatmentArgs,
  ): Promise<GetDoctorTreatmentResponse> {
    return await this.treatmentsService.getDoctorTreatment(args);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UpdateTreatmentComplaintResponse, {
    name: 'updateTreatmentComplaints',
  })
  async updateTreatmentComplaints(
    @Args({ name: 'input' }) input: UpdateTreatmentComplaintInput,
  ): Promise<UpdateTreatmentComplaintResponse> {
    return await this.treatmentsService.updateTreatmentComplaints(input);
  }

  @Query(() => GetTreatmentProfileResponse, { name: 'getTreatmentProfile' })
  async getTreatmentProfile(
    @Args() args: GetTreatmentProfileArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<GetTreatmentProfileResponse> {
    return await this.treatmentsService.getTreatmentProfile(args, lang);
  }

  @Query(() => GetTreatmentComplaintsListResponse, {
    name: 'getTreatmentComplaintList',
  })
  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getTreatmentComplaintList(
    @I18nNextLanguage() lang: string,
  ): Promise<GetTreatmentComplaintsListResponse> {
    return await this.treatmentsService.getTreatmentComplaintList(lang);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetUserTreatmentTeamResponse, { name: 'getUserTreatmentTeam' })
  async getUserTreatmentTeam(
    @GetUser() user: LoggedInUser,
  ): Promise<GetUserTreatmentTeamResponse> {
    return await this.treatmentsService.getUserTreatmentTeam(user.id);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetUserUnassignedTreatmentBuddiesResponse, {
    name: 'getUserUnassignedTreatmentBuddies',
  })
  async getUserUnassignedTreatmentBuddies(
    @GetUser() user: LoggedInUser,
    @Args() args: GetUserUnassignedTreatmentBuddiesArgs,
  ): Promise<GetUserUnassignedTreatmentBuddiesResponse> {
    return await this.treatmentsService.getUserUnassignedTreatmentBuddies(
      user.id,
      args,
    );
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetUserTreatmentProfileResponse, {
    name: 'getUserTreatmentProfile',
  })
  async getUserTreatmentProfile(
    @GetUser() user: LoggedInUser,
    @I18nNextLanguage() lang: string,
  ): Promise<GetUserTreatmentProfileResponse> {
    return await this.treatmentsService.getUserTreatmentProfile(user.id, lang);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetAppointmentDoctorListResponse, {
    name: 'getAppointmentDoctorList',
  })
  async getAppointmentDoctorList(
    @Args() args: GetAppointmentDoctorListArgs,
  ): Promise<GetAppointmentDoctorListResponse> {
    return this.treatmentsService.getAppointmentDoctorList(args);
  }

  @Query(() => GetDoctorPatientListResponse, {
    name: 'getDoctorPatientsList',
  })
  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getDoctorPatientList(
    @GetUser() doctor: LoggedInUser,
    @Args() args: GetDoctorPatientListArgs,
  ): Promise<GetDoctorPatientListResponse> {
    return await this.treatmentsService.getDoctorPatientsList(
      doctor.id,
      args.search,
    );
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => CloseTreatmentResponse, { name: 'closeTreatment' })
  async closeTreatment(
    @GetUser() doctor: LoggedInUser,
    @Args() args: CloseTreatmentArgs,
  ): Promise<CloseTreatmentResponse> {
    return await this.treatmentsService.closeTreatment(
      doctor.id,
      args.treatment_id,
    );
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UpdateTreatmentUserProfileResponse, {
    name: 'updateTreatmentUserProfile',
  })
  async updateTreatmentUserProfile(
    @GetUser() doctor: LoggedInUser,
    @Args('input') input: UpdateTreatmentUserProfileInput,
  ): Promise<UpdateTreatmentUserProfileResponse> {
    return await this.treatmentsService.updateTreatmentUserProfile(
      doctor.id,
      input,
    );
  }

  @Roles(UserRoles.DOCTOR, UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => SendTreatmentFileEmailResponse, {
    name: 'sendTreatmentFileEmail',
  })
  async sendTreatmentFileEmail(
    @GetUser() user: LoggedInUser,
    @Args() args: SendTreatmentFileEmailArgs,
  ): Promise<SendTreatmentFileEmailResponse> {
    const { treatmentId } = args;
    return await this.treatmentsService.sendTreatmentFileEmail(
      treatmentId,
      user.id,
    );
  }

  @Query(() => ActiveTreatmentResponse, {
    name: 'activeTreatment',
  })
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async activeTreatment(
    @GetUser() user: LoggedInUser,
  ): Promise<ActiveTreatmentResponse> {
    return await this.treatmentsService.activeTreatment(user.id);
  }
}
