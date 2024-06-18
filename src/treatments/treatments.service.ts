import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { TreatmentsRepo } from './treatments.repo';
import {
  AddTreatmentArgs,
  DoctorTreatmentDto,
  TreatmentResponse,
} from './dto/add-treatment.dto';
import {
  JoinTreatmentArgs,
  JoinTreatmentResponse,
} from './dto/join-treatment.dto';
import { DeleteTreatmentResponse } from './dto/delete-treatment.dto';
import {
  UpdateTreatmentArchiveStatusArgs,
  UpdateTreatmentArchiveStatusResponse,
} from './dto/update-archive-treatment-status.dto';
import { TranslationService } from '@shared/services/translation/translation.service';
import { GetTreatmentTeamResponse } from './dto/get-treatment-team.dto';
import {
  AddTreatmentBuddyResponse,
  TreatmentBuddyInput,
} from './dto/add-treatment-buddy.dto';
import {
  GetUnassignedTreatmentDoctorsArgs,
  GetUnassignedTreatmentDoctorsResponse,
} from './dto/get-unassigned-treatment-doctors.dto';
import {
  GetUnassignedTreatmentBuddiesArgs,
  GetUnassignedTreatmentBuddiesResponse,
} from './dto/get-treatment-buddies-list.dto';
import {
  AddDoctorTreatmentArgs,
  AddDoctorTreatmentResponse,
} from './dto/add-doctor-treatment.dto';
import {
  RemoveDoctorTreatmentArgs,
  RemoveDoctorTreatmentResponse,
} from './dto/remove-doctor-treatment.dto';
import { RemoveTreatmentBuddyResponse } from './dto/delete-treatment-buddy.dto';
import {
  ChangeCoachRoleArgs,
  ChangeCoachRoleResponse,
} from './dto/change-coach-role.dto';
import {
  GetDoctorTreatmentArgs,
  GetDoctorTreatmentResponse,
} from './dto/get-doctor-treatment.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  DoctorTreatmentArchiveStatusUpdatedEvent,
  StartProgramTreatmentDeletedEvent,
  TreatmentAddedEvent,
  TreatmentClosedEvent,
  TreatmentFileAttachedEvent,
  TreatmentTeamBuddyAddedEvent,
  TreatmentTeamCoachAddedEvent,
  TreatmentsEvent,
} from './treatments.event';

import { UpdateTreatmentComplaintInput } from './dto/update-treatment-complaints.dto';
import { TreatmentPatientComplaint } from './entities/treatment-patient-complaints.entity';
import {
  GetTreatmentProfileArgs,
  GetTreatmentProfileResponse,
  TreatmentProfileDto,
} from './dto/get-user-treatment-profile.dto';
import { TreatmentComplaint } from './entities/treatment-complaints.entity';
import { GetTreatmentComplaintsListResponse } from './dto/treatment_complaints-list.dto';
import { MembershipStage } from '@membership-stages/membership-stages.model';
import { GetUserTreatmentTeamResponse } from './dto/get-user-treatment-team.dto';
import {
  GetUserUnassignedTreatmentBuddiesArgs,
  GetUserUnassignedTreatmentBuddiesResponse,
} from './dto/get-user-treatment-buddies-list.dto';
import {
  GetUserTreatmentProfileResponse,
  UserTreatmentProfileDto,
} from './dto/get-treatment-profile.dto';
import {
  GetAppointmentDoctorListArgs,
  GetAppointmentDoctorListResponse,
} from './dto/get-treatment-doctor-list.dto';
import { GetDoctorPatientListResponse } from './dto/get-doctor-patients-list.dto';
import { Response } from 'express';
import { ReadStream, createReadStream, createWriteStream, unlink } from 'fs';
import { join } from 'path';
import { TreatmentFileData } from './dto/download-treatment-file.dto';
import { DateTime } from 'luxon';
import { UserRoles } from '@users/users.dto';
import { TreatmentType } from './enum/treatments.enum';
import { Treatment } from './entities/treatments.entity';
import { CloseTreatmentResponse } from './dto/close-treatment.dto';
import {
  UpdateTreatmentUserProfileDto,
  UpdateTreatmentUserProfileInput,
  UpdateTreatmentUserProfileResponse,
} from './dto/update-treatment-user-profile.dto';
import { SendTreatmentFileEmailResponse } from './dto/send-treatment-file-email.dto';
import { ActiveTreatmentResponse } from './dto/active-treatment.dto';
import { AuthService } from '@shared/auth/auth.service';
import { RedisService } from '@core/modules/redis/redis.service';
import { Users } from '@users/users.model';

@Injectable()
export class TreatmentsService {
  private readonly logger = new Logger(TreatmentsService.name);
  constructor(
    private readonly treatmentsRepo: TreatmentsRepo,
    private readonly translationService: TranslationService,
    private readonly eventEmitter: EventEmitter2,
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
  ) {}

  async addTreatmentAndDoctorTreatment(
    args: AddTreatmentArgs,
    treatmentType: TreatmentType,
    doctorId: string,
    hasParticiapatedInStartProgram: boolean,
  ): Promise<TreatmentResponse> {
    const { user_id, option_id, role } = args;

    const treatment = await this.treatmentsRepo.addTreatment(
      user_id,
      option_id,
      treatmentType,
      hasParticiapatedInStartProgram,
    );

    const addDoctorTreatmentInput: DoctorTreatmentDto = {
      doctor_id: doctorId,
      treatment_id: treatment.id,
      role: role,
      updated_by: doctorId,
      created_by: doctorId,
      is_owner: true,
    };

    const savedDoctorTreatment = await this.treatmentsRepo.addDoctorTreatment(
      addDoctorTreatmentInput,
    );

    this.eventEmitter.emit(
      TreatmentsEvent.TREATMENT_ADDED,
      new TreatmentAddedEvent(user_id, savedDoctorTreatment),
    );

    const treatmentResponse: TreatmentResponse = {
      ...treatment,
      is_treatment_exist: false,
    };

    return treatmentResponse;
  }

  async deleteStartProgramTreatmentAndDoctorsTreatment(
    treatmentId: string,
    doctorId: string,
  ): Promise<Treatment> {
    const deletedTreatment = await this.treatmentsRepo.deleteTreatment(
      treatmentId,
    );

    await this.treatmentsRepo.deleteDoctorsTreatment(
      doctorId,
      deletedTreatment.id,
    );

    this.eventEmitter.emit(
      TreatmentsEvent.START_PROGRAM_TREATMENT_DELETED,
      new StartProgramTreatmentDeletedEvent(deletedTreatment),
    );

    return deletedTreatment;
  }

  async addTreatment(
    doctorId: string,
    args: AddTreatmentArgs,
  ): Promise<TreatmentResponse> {
    const { user_id, option_id } = args;

    const [user, treatmentOption, existingTreatment] = await Promise.all([
      this.treatmentsRepo.getUserById(user_id),
      this.treatmentsRepo.getTreatmentOptionById(option_id),
      this.treatmentsRepo.getTreatment(user_id),
    ]);

    if (!user) {
      throw new NotFoundException(`treatments.patient_not_found`);
    }
    if (!treatmentOption) {
      throw new NotFoundException(`treatments.treatment_option_not_found`);
    }

    const { treatment_type } = treatmentOption;

    if (!existingTreatment) {
      const hasParticiapatedInStartProgram =
        treatment_type === TreatmentType.START_PROGRAM;

      return await this.addTreatmentAndDoctorTreatment(
        args,
        treatment_type,
        doctorId,
        hasParticiapatedInStartProgram,
      );
    }

    if (treatmentOption.treatment_type === TreatmentType.START_PROGRAM) {
      throw new BadRequestException(
        `treatments.start_program_can_not_be_added`,
      );
    }

    /* If existing treatment's  treatment_type is START_PROGRAM then we delete the existing treatment and add new  */
    if (existingTreatment.treatment_type === TreatmentType.START_PROGRAM) {
      await this.deleteStartProgramTreatmentAndDoctorsTreatment(
        existingTreatment.id,
        doctorId,
      );

      return await this.addTreatmentAndDoctorTreatment(
        args,
        treatment_type,
        doctorId,
        true,
      );
    }

    const doctorTreatment = await this.treatmentsRepo.getDoctorTreatment(
      existingTreatment.id,
      doctorId,
    );

    if (doctorTreatment) {
      throw new BadRequestException(`treatments.treatment_exist`);
    }

    return {
      ...existingTreatment,
      is_treatment_exist: true,
    };
  }

  async joinTreatment(
    doctorId: string,
    input: JoinTreatmentArgs,
  ): Promise<JoinTreatmentResponse> {
    const { treatment_id } = input;
    const treatment = await this.treatmentsRepo.getTreatmentById(treatment_id);
    if (!treatment) {
      throw new NotFoundException(`treatments.treatment_not_found`);
    }
    const doctorTreatment = await this.treatmentsRepo.getDoctorTreatment(
      treatment_id,
      doctorId,
    );
    if (doctorTreatment) {
      throw new BadRequestException(`treatments.treatment_exist`);
    }
    const inputData: DoctorTreatmentDto = {
      doctor_id: doctorId,
      updated_by: doctorId,
      created_by: doctorId,
      ...input,
    };
    const saveDoctorTreatment = await this.treatmentsRepo.addDoctorTreatment(
      inputData,
    );
    return saveDoctorTreatment;
  }

  async deleteTreatment(
    doctorTreatmentId: string,
    doctorId: string,
  ): Promise<DeleteTreatmentResponse> {
    const doctorTreatment = await this.treatmentsRepo.getdoctorTreatmentById(
      doctorTreatmentId,
    );
    if (!doctorTreatment) {
      throw new NotFoundException(`treatments.treatment_not_found`);
    }
    const { treatment_id } = doctorTreatment;
    const treatment = await this.treatmentsRepo.getTreatmentById(treatment_id);
    if (!treatment) {
      throw new NotFoundException(`treatments.treatment_not_found`);
    }
    const deleteDoctorTreatment =
      await this.treatmentsRepo.deleteDoctorTreatment(
        doctorTreatmentId,
        doctorId,
      );
    const treatmentDoctorCount =
      await this.treatmentsRepo.getTreatmentDoctorsCount(treatment_id);

    if (treatmentDoctorCount.total < 1) {
      await this.treatmentsRepo.deleteTreatment(treatment_id);
    }

    //TODO: Emit event
    // this.eventEmitter.emit(
    //   TreatmentsEvent.DOCTOR_TREATMENT_DELETED,
    //   new DoctorTreatmentDeletedEvent(doctorId, treatment.user_id),
    // );

    return deleteDoctorTreatment;
  }

  async updateTreatmentArchiveStatus(
    args: UpdateTreatmentArchiveStatusArgs,
    doctorId: string,
  ): Promise<UpdateTreatmentArchiveStatusResponse> {
    const { is_archived, treatmentId: doctorTreatmentId } = args;
    const doctorTreatment = await this.treatmentsRepo.getdoctorTreatmentById(
      doctorTreatmentId,
    );

    if (!doctorTreatment) {
      throw new NotFoundException(`treatments.treatment_not_found`);
    }

    if (is_archived && doctorTreatment.is_archived) {
      throw new BadRequestException(`treatments.treatment_already_archived`);
    }

    if (!is_archived && !doctorTreatment.is_archived) {
      throw new BadRequestException(`treatments.treatment_already_unArchived`);
    }

    const updatedDoctorTreatment =
      await this.treatmentsRepo.updateTreatmentArchiveStatus(
        doctorTreatmentId,
        is_archived,
        doctorId,
      );

    const message = updatedDoctorTreatment.is_archived
      ? {
          message: this.translationService.translate(
            `treatments.treatment_archived`,
          ),
        }
      : {
          message: this.translationService.translate(
            `treatments.treatment_unarchived`,
          ),
        };

    this.eventEmitter.emit(
      TreatmentsEvent.DOCTOR_TREATMENT_ARCHIVE_STATUS_UPDATED,
      new DoctorTreatmentArchiveStatusUpdatedEvent(updatedDoctorTreatment),
    );

    return message;
  }

  async getTreatmentTeam(
    treatmentId: string,
  ): Promise<GetTreatmentTeamResponse> {
    const treatment = await this.treatmentsRepo.getTreatmentById(treatmentId);
    if (!treatment) {
      throw new NotFoundException(`treatments.treatment_not_found`);
    }
    const treatmentTeams = await this.treatmentsRepo.getTreatmentTeam(
      treatmentId,
    );
    return treatmentTeams;
  }

  async addTreatmentBuddy(
    userId: string,
    treatmentId: string,
    buddyId: string,
  ): Promise<AddTreatmentBuddyResponse> {
    const [treatment, buddy, isBuddyAlreadyAdded] = await Promise.all([
      this.treatmentsRepo.getTreatmentById(treatmentId),
      this.treatmentsRepo.getUserById(buddyId),
      this.treatmentsRepo.getTreatmentBuddy(treatmentId, buddyId),
    ]);

    if (!treatment) {
      throw new NotFoundException('treatments.treatment_not_found');
    }
    if (!buddy) {
      throw new NotFoundException('treatments.buddy_not_found');
    }
    if (isBuddyAlreadyAdded) {
      throw new BadRequestException(`treatments.buddy_already_added`);
    }
    const treatmentBuddyInput: TreatmentBuddyInput = {
      treatment_id: treatmentId,
      user_id: buddyId,
      is_deleted: false,
      created_by: userId,
      updated_by: userId,
    };
    const savedTreatmentBuddy = await this.treatmentsRepo.addTreatmentBuddy(
      treatmentBuddyInput,
    );
    this.eventEmitter.emit(
      TreatmentsEvent.TREATMENT_TEAM_BUDDY_ADDED,
      new TreatmentTeamBuddyAddedEvent(savedTreatmentBuddy),
    );
    return {
      message: this.translationService.translate(
        `treatments.treatment_buddy_is_added_successfully`,
      ),
    };
  }
  async getUnassignedTreatmentDoctors(
    doctorId: string,
    args: GetUnassignedTreatmentDoctorsArgs,
  ): Promise<GetUnassignedTreatmentDoctorsResponse> {
    const { text, page, limit, treatmentId } = args;
    const doctor = await this.treatmentsRepo.getDoctorById(doctorId);
    if (!doctor) {
      throw new NotFoundException(`doctors.doctor_not_found`);
    }
    const { organization_id } = doctor;
    const { doctors, total } =
      await this.treatmentsRepo.getUnassignedTreatmentDoctors(
        page,
        limit,
        organization_id,
        treatmentId,
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

  async removeTreatmentBuddy(
    treatmentId: string,
    buddyId: string,
  ): Promise<RemoveTreatmentBuddyResponse> {
    const treatmentBuddy = await this.treatmentsRepo.getTreatmentBuddy(
      treatmentId,
      buddyId,
    );
    if (!treatmentBuddy) {
      throw new NotFoundException(`treatments.treatment_buddy_not_available`);
    }
    await this.treatmentsRepo.deleteTreatmentBuddy(treatmentBuddy.id);
    return {
      message: this.translationService.translate(
        'treatments.treatment_buddy_deleted_successfully',
      ),
    };
  }

  async getUnassignedTreatmentBuddies(
    args: GetUnassignedTreatmentBuddiesArgs,
  ): Promise<GetUnassignedTreatmentBuddiesResponse> {
    const { search, page, limit, treatmentId, userId } = args;
    const treatment = await this.treatmentsRepo.getTreatmentById(treatmentId);
    if (!treatment) {
      throw new NotFoundException('treatments.treatment_not_found');
    }
    const { buddies, total } =
      await this.treatmentsRepo.getUnassignedTreatmentBuddies(
        page,
        limit,
        treatmentId,
        userId,
        search,
      );
    const total_pages = Math.ceil(total / limit);
    return {
      total: total,
      totalPage: total_pages,
      page: page,
      limit: limit,
      buddies: buddies,
    };
  }

  async removeDoctorTreatment(
    loggedInDoctorId: string,
    args: RemoveDoctorTreatmentArgs,
  ): Promise<RemoveDoctorTreatmentResponse> {
    const { doctorId, treatmentId } = args;

    const [treatment, doctorTreatment] = await Promise.all([
      this.treatmentsRepo.getTreatmentById(treatmentId),
      this.treatmentsRepo.getDoctorTreatment(treatmentId, doctorId),
    ]);

    if (!treatment) {
      throw new NotFoundException(`treatments.treatment_not_found`);
    }

    if (!doctorTreatment) {
      throw new NotFoundException(`treatments.doctor_treatment_not_found`);
    }

    const { is_deleted, id: doctorTreatmentId } = doctorTreatment;

    if (is_deleted) {
      throw new BadRequestException(
        `treatments.doctor_treatment_already_deleted`,
      );
    }

    await this.treatmentsRepo.deleteDoctorTreatment(
      doctorTreatmentId,
      loggedInDoctorId,
    );

    //TODO: Emit event
    // this.eventEmitter.emit(
    //   TreatmentsEvent.DOCTOR_TREATMENT_DELETED,
    //   new DoctorTreatmentDeletedEvent(treatmentDoctorId, treatment.user_id),
    // );

    return {
      message: this.translationService.translate(
        `treatments.doctor_treatment_removed`,
      ),
    };
  }

  async addDoctorTreatment(
    doctorId: string,
    input: AddDoctorTreatmentArgs,
  ): Promise<AddDoctorTreatmentResponse> {
    const { treatment_id, doctor_id } = input;
    const treatment = await this.treatmentsRepo.getTreatmentById(treatment_id);
    if (!treatment) {
      throw new NotFoundException(`treatments.treatment_not_found`);
    }
    const doctorTreatment = await this.treatmentsRepo.getDoctorTreatment(
      treatment_id,
      doctor_id,
    );
    if (doctorTreatment) {
      throw new BadRequestException(`treatments.treatment_exist`);
    }
    const inputData: DoctorTreatmentDto = {
      ...input,
      updated_by: doctorId,
      created_by: doctorId,
    };
    const savedDoctorTreatment = await this.treatmentsRepo.addDoctorTreatment(
      inputData,
    );
    this.eventEmitter.emit(
      TreatmentsEvent.TREATMENT_TEAM_COACH_ADDED,
      new TreatmentTeamCoachAddedEvent(savedDoctorTreatment),
    );
    return {
      message: this.translationService.translate(
        `treatments.doctor_treatment_created`,
      ),
    };
  }

  async changeCoachRole(
    doctorId: string,
    args: ChangeCoachRoleArgs,
  ): Promise<ChangeCoachRoleResponse> {
    const { coachId, treatmentId, treatment_role } = args;
    const doctorTreatment = await this.treatmentsRepo.getDoctorTreatment(
      treatmentId,
      coachId,
    );
    if (!doctorTreatment) {
      throw new NotFoundException(`treatments.doctor_treatment_not_found`);
    }
    await this.treatmentsRepo.updateCoachRole(
      doctorId,
      coachId,
      treatmentId,
      treatment_role,
    );
    return {
      message: this.translationService.translate(
        'treatments.role_changed_successfully',
      ),
    };
  }

  async getDoctorTreatment(
    args: GetDoctorTreatmentArgs,
  ): Promise<GetDoctorTreatmentResponse> {
    const { treatmentId, doctorId } = args;
    const doctorTreatment = await this.treatmentsRepo.getDoctorTreatment(
      treatmentId,
      doctorId,
    );
    if (!doctorTreatment) {
      throw new NotFoundException(`treatments.doctor_treatment_not_found`);
    }
    return { doctorTreatment };
  }

  async updateTreatmentComplaints(
    input: UpdateTreatmentComplaintInput,
  ): Promise<{ message: string }> {
    const { treatmentComplaintsIds, userId, treatmentId } = input;

    const uniqueTreatmentComplaintId = [...new Set(treatmentComplaintsIds)];

    const count = await this.treatmentsRepo.getTreatmentComplaintsCount(
      uniqueTreatmentComplaintId,
    );

    if (uniqueTreatmentComplaintId.length !== count) {
      throw new NotFoundException(`treatments.treatment_complaint_not_found`);
    }

    const promises: Promise<TreatmentPatientComplaint[]>[] = [];
    await this.treatmentsRepo.deleteTreatmentPatientComplaint(userId);

    if (uniqueTreatmentComplaintId.length) {
      const insertTreatmentPatientComplaintsInput =
        uniqueTreatmentComplaintId.map((treatmentComplaintsIds) => ({
          user_id: userId,
          treatment_id: treatmentId,
          treatment_complaint_id: treatmentComplaintsIds,
        }));
      const insertTreatmentComplaintsPromise =
        this.treatmentsRepo.addTreatmentPatientComplaints(
          insertTreatmentPatientComplaintsInput,
        );
      promises.push(insertTreatmentComplaintsPromise);
    }

    await Promise.all(promises);

    return {
      message: `${this.translationService.translate(
        'treatments.update_treatment_complaints',
      )}`,
    };
  }

  async getTreatmentComplaintList(
    lang: string,
  ): Promise<GetTreatmentComplaintsListResponse> {
    const treatmentComplaintList =
      await this.treatmentsRepo.getTreatmentComplaintList();

    if (!treatmentComplaintList.length) {
      throw new NotFoundException(
        `treatments.treatment_complains_list_not_found`,
      );
    }

    const translatedTreatmentComplaintList =
      this.translationService.getTranslations<TreatmentComplaint>(
        treatmentComplaintList,
        ['title'],
        lang,
      );

    return { treatmentComplaint: translatedTreatmentComplaintList };
  }

  async getTreatmentProfile(
    args: GetTreatmentProfileArgs,
    lang: string,
  ): Promise<GetTreatmentProfileResponse> {
    const { treatmentId, userId } = args;
    const treatmentProfile = await this.treatmentsRepo.getTreatmentProfile(
      treatmentId,
      userId,
    );

    if (!treatmentProfile) {
      throw new NotFoundException(`treatments.treatment_profile_not_found`);
    }

    let translatedMembetshipStage = null;

    if (treatmentProfile.membership_stage) {
      [translatedMembetshipStage] =
        this.translationService.getTranslations<MembershipStage>(
          [treatmentProfile.membership_stage],
          ['title'],
          lang,
        );
    }

    const [translatedTreatmentType] =
      this.translationService.getTranslations<TreatmentProfileDto>(
        [treatmentProfile],
        ['title'],
        lang,
      );

    const [translatedTreatmentComplaints] =
      treatmentProfile.treatment_complaints.map(() => {
        return this.translationService.getTranslations<TreatmentComplaint>(
          treatmentProfile.treatment_complaints,
          ['title'],
          lang,
        );
      });
    return {
      treatmentProfile: {
        first_name: treatmentProfile.first_name,
        last_name: treatmentProfile.last_name,
        full_name: treatmentProfile.full_name,
        user_name: treatmentProfile.user_name,
        email: treatmentProfile.email,
        gender: treatmentProfile.gender,
        date_of_birth: treatmentProfile.date_of_birth,
        avatar_image_name: treatmentProfile.avatar_image_name,
        friends_count: treatmentProfile.friends_count,
        helped_count: treatmentProfile.helped_count,
        treatment_type: translatedTreatmentType.title,
        membership_level: treatmentProfile.membership_level,
        treatment_complaints: translatedTreatmentComplaints,
        membership_stage: translatedMembetshipStage,
      },
    };
  }

  async getUserTreatmentTeam(
    userId: string,
  ): Promise<GetUserTreatmentTeamResponse> {
    const treatmentTeams = await this.treatmentsRepo.getUserTreatmentTeam(
      userId,
    );
    if (!treatmentTeams) {
      return {
        treatment: undefined,
        buddies: [],
        coaches: [],
      };
    }
    return treatmentTeams;
  }

  async getUserUnassignedTreatmentBuddies(
    userId: string,
    args: GetUserUnassignedTreatmentBuddiesArgs,
  ): Promise<GetUserUnassignedTreatmentBuddiesResponse> {
    const { search, page, limit, treatmentId } = args;
    const treatment = await this.treatmentsRepo.getTreatmentById(treatmentId);
    if (!treatment) {
      throw new NotFoundException('treatments.treatment_not_found');
    }
    const { buddies, total } =
      await this.treatmentsRepo.getUnassignedTreatmentBuddies(
        page,
        limit,
        treatmentId,
        userId,
        search,
      );
    const hasMore = args.page * args.limit < total;
    return {
      buddies: buddies,
      hasMore: hasMore,
    };
  }

  async getUserTreatmentProfile(
    userId: string,
    lang: string,
  ): Promise<GetUserTreatmentProfileResponse> {
    const userTreatmentProfile =
      await this.treatmentsRepo.getUserTreatmentProfile(userId);
    if (!userTreatmentProfile) {
      return { userTreatmentProfile: undefined };
    }

    let translatedUserTreatmentProfile = null;

    if (userTreatmentProfile) {
      [translatedUserTreatmentProfile] =
        this.translationService.getTranslations<UserTreatmentProfileDto>(
          [userTreatmentProfile],
          ['title'],
          lang,
        );
    }
    return {
      userTreatmentProfile: {
        ...userTreatmentProfile,
        treatment_type: translatedUserTreatmentProfile?.title,
      },
    };
  }

  async getAppointmentDoctorList(
    args: GetAppointmentDoctorListArgs,
  ): Promise<GetAppointmentDoctorListResponse> {
    const { treatmentId } = args;
    const treatment = await this.treatmentsRepo.getTreatmentById(treatmentId);
    if (!treatment) {
      throw new NotFoundException(`treatments.treatment_not_found`);
    }
    const doctors = await this.treatmentsRepo.getAppointmentDoctorList(
      treatmentId,
    );
    return { doctors: doctors };
  }

  async getDoctorPatientsList(
    doctorId: string,
    search?: string,
  ): Promise<GetDoctorPatientListResponse> {
    const patients = await this.treatmentsRepo.getDoctorPatientsList(
      doctorId,
      search,
    );
    return { patients };
  }

  async downloadTreatmentFile(
    response: Response,
    treatmentId: string,
    lang: string,
  ): Promise<StreamableFile> {
    const treatment = await this.treatmentsRepo.getTreatmentAndUser(
      treatmentId,
      false,
    );

    if (!treatment) {
      throw new NotFoundException(`treatments.treatment_not_found`);
    }

    const [
      treatmentDoctors,
      userGoalsWithGoalLevel,
      treatmentAppointments,
      treatmentTimelineNotes,
      termsAndConditionsAndPrivacyPolicy,
    ] = await Promise.all([
      this.treatmentsRepo.getTreatmentDoctors(treatment.id),
      this.treatmentsRepo.getUserGoalsWithGoalLevel(treatment.user_id, lang),
      this.treatmentsRepo.getUserTreatmentAppointments(treatment.id),
      this.treatmentsRepo.getUserTreatmentTimelineNotes(treatment.id),
      this.treatmentsRepo.getTermsAndConditionsAndPrivacyPolicy(lang),
    ]);

    const data: TreatmentFileData = {
      treatment,
      treatmentDoctors,
      userGoalsWithGoalLevel,
      treatmentAppointments,
      treatmentTimelineNotes,
      termsAndConditionsAndPrivacyPolicy,
    };

    return await this.writeToTreatmentFile(data, response);
  }

  async closeTreatment(
    doctorId: string,
    treatmentId: string,
  ): Promise<CloseTreatmentResponse> {
    const treatment = await this.treatmentsRepo.getTreatmentById(treatmentId);

    if (!treatment) {
      throw new NotFoundException(`treatments.treatment_not_found`);
    }

    const deletedTreatment = await this.treatmentsRepo.deleteTreatment(
      treatment.id,
    );

    await Promise.all([
      this.treatmentsRepo.deleteDoctorsTreatment(doctorId, deletedTreatment.id),
      this.treatmentsRepo.updateTreatmentChatDisableAndChatUsersArchiveStatus(
        deletedTreatment.id,
        true,
      ),
    ]);

    this.eventEmitter.emit(
      TreatmentsEvent.TREATMENT_CLOSED,
      new TreatmentClosedEvent(deletedTreatment),
    );
    return { treatment: deletedTreatment };
  }

  async updateTreatmentUserProfile(
    doctorId: string,
    input: UpdateTreatmentUserProfileInput,
  ): Promise<UpdateTreatmentUserProfileResponse> {
    const { treatmentId, first_name, last_name, date_of_birth, gender } = input;
    const treatment = await this.treatmentsRepo.getTreatmentById(treatmentId);
    if (!treatment) {
      throw new NotFoundException(`treatments.treatment_not_found`);
    }
    const doctorTreatment = await this.treatmentsRepo.getDoctorTreatment(
      treatmentId,
      doctorId,
    );
    if (!doctorTreatment) {
      throw new NotFoundException(`treatments.doctor_treatment_not_found`);
    }

    const updateProfileData: UpdateTreatmentUserProfileDto = {
      first_name,
      last_name,
      date_of_birth,
      gender,
    };
    await this.treatmentsRepo.updateUserProfile(
      treatment.user_id,
      updateProfileData,
    );
    return {
      message: `${this.translationService.translate(
        'treatments.update_treatment_user_profile',
      )}`,
    };
  }

  async getTreatmentFileReadableStream(
    data: TreatmentFileData,
  ): Promise<{ readableStream: ReadStream; fileName: string }> {
    const {
      treatment,
      treatmentDoctors,
      userGoalsWithGoalLevel,
      treatmentAppointments,
      treatmentTimelineNotes,
      termsAndConditionsAndPrivacyPolicy,
    } = data;

    const { users, created_at: startDate, updated_at: endDate } = treatment;
    const { first_name, last_name, user_name } = users;
    const name = first_name
      ? `${first_name}${last_name ? '_' + last_name : ''}`
      : user_name;
    const fullname = first_name
      ? `${first_name}${last_name ? ' ' + last_name : ''}`
      : user_name;

    const fileName = `${name}_treatment_file.txt`;
    const filePath = join(__dirname, fileName);

    // Create a writable stream to the file
    const writeStream = createWriteStream(filePath, { encoding: 'utf-8' });

    writeStream.write(`VERTROUWELIJKE INFORMATIE\nPATIENT HEALTHFILE\n`);

    writeStream.write(`Full Name : ${fullname}\n`);
    writeStream.write(
      `Start Date : ${DateTime.fromJSDate(startDate).toFormat(
        'dd-MM-yyyy HH:mm:ss',
      )}\n`,
    );
    writeStream.write(
      `End Date : ${DateTime.fromJSDate(endDate).toFormat(
        'dd-MM-yyyy HH:mm:ss',
      )}\n\n`,
    );

    writeStream.write(
      `============================================================\n`,
    );

    writeStream.write(`Team Members & Roles\n\n`);
    treatmentDoctors.forEach((treatmentDoctor) => {
      writeStream.write(
        `Full Name : ${treatmentDoctor.doctor.first_name} ${treatmentDoctor.doctor.last_name}\n`,
      );
      writeStream.write(`Role : ${treatmentDoctor.role}\n`);
      writeStream.write(
        `Archived : ${treatmentDoctor.is_archived ? 'YES' : 'NO'}\n\n`,
      );
    });

    writeStream.write(
      `============================================================\n`,
    );
    writeStream.write(`GOALS\n\n`);
    userGoalsWithGoalLevel.forEach((goal) => {
      writeStream.write(`Goal Name : ${goal.title}\n`);
      writeStream.write(
        `Goal Level : ${
          goal.user_goal_level?.title ? goal.user_goal_level?.title : ' '
        }\n\n`,
      );
    });

    writeStream.write(
      `============================================================\n`,
    );

    writeStream.write(`APPOINTMENTS\n\n`);
    treatmentAppointments.forEach((appointment) => {
      writeStream.write(
        `Coach Fullname : ${appointment.doctor_first_name} ${appointment.doctor_last_name}\n`,
      );
      writeStream.write(`Coach Role : ${appointment.doctor_role}\n`);
      writeStream.write(
        `Appointment date : ${DateTime.fromJSDate(
          new Date(appointment.start_date),
        ).toFormat('dd-MM-yyyy')}\n`,
      );
      writeStream.write(
        `Appointment start time : ${DateTime.fromJSDate(
          new Date(appointment.start_date),
        ).toFormat('HH:mm:ss')}\n`,
      );

      writeStream.write(
        `Appointment end time : ${
          appointment.end_date
            ? DateTime.fromJSDate(new Date(appointment.end_date)).toFormat(
                'HH:mm:ss',
              )
            : ''
        }\n`,
      );
      writeStream.write(`Appointment type : ${appointment.appointment_type}\n`);
      writeStream.write(`Appointment location : ${appointment.location}\n\n`);
      //writeStream.write(`Appointment status : ${appointment.status}\n\n`); we don't have status feature
    });

    writeStream.write(
      `============================================================\n`,
    );
    //TODO: Forms Download
    writeStream.write(`FORMS\n\n`);
    // forms.forEach((form: any) => {
    //   writeStream.write(`Name form : ${form.name}\n`);
    //   writeStream.write(`Form description : ${form.description}\n`);
    //   form.questions.forEach((question: any) => {
    //     writeStream.write(`Q. ${question.question}\n`);
    //     writeStream.write(`A. ${question.answer}\n`);
    //   });
    //   writeStream.write(`Form result : ${form.result}\n\n`);
    // });

    writeStream.write(
      `============================================================\n`,
    );
    writeStream.write(`NOTES\n\n`);
    treatmentTimelineNotes.forEach((note) => {
      writeStream.write(`Note title : ${note.title}\n`);
      writeStream.write(`Note description : ${note.description}\n`);
      writeStream.write(
        `Coach : ${note.role === UserRoles.DOCTOR ? 'YES' : 'NO'}\n`,
      );
      writeStream.write(
        `Note type : ${
          note.is_private_note ? 'PRIVATE NOTE' : 'SESSION NOTE'
        }\n`,
      );
      writeStream.write(
        `Note added date : ${DateTime.fromJSDate(
          new Date(note.created_at),
        ).toFormat('dd-MM-yyyy HH:mm:ss')}\n\n`,
      );
    });

    writeStream.write(
      `============================================================\n`,
    );
    writeStream.write(`LOGDATA HEALTHFILE\n\n`);
    // writeStream.write(`Seen By : ${logData.seenBy}\n`);
    // writeStream.write(`Roles : ${logData.roles}\n`);
    // writeStream.write(`View Date : ${logData.viewDate}\n\n`);

    writeStream.write(
      `============================================================\n`,
    );
    writeStream.write(`PAGES\n\n`);

    writeStream.write(`-- : Terms and Conditions\n\n`);
    //TODO: Render HTML
    writeStream.write(
      `${termsAndConditionsAndPrivacyPolicy.terms_and_condition_info.replace(
        /<[^>]*>/g,
        '',
      )}\n\n`,
    );
    writeStream.write(`-- : Privacy Policy\n\n`);
    writeStream.write(
      `${termsAndConditionsAndPrivacyPolicy.privacy_policy_info.replace(
        /<[^>]*>/g,
        '',
      )}\n\n`,
    );
    // Close the writable stream
    writeStream.end('\n');

    // Wait for the write stream to finish writing the file
    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    const readableStream = createReadStream(filePath, {
      encoding: 'utf-8',
      highWaterMark: 16 * 1024,
    });

    // Close the readable stream after piping it to the response
    readableStream.on('close', () => {
      writeStream.close();
      //  delete the file after it has been sent
      unlink(filePath, (error) => {
        if (error) {
          this.logger.error(error);
          throw new BadRequestException('Error deleting file');
        }
      });
    });

    return { readableStream, fileName };
  }

  async writeToTreatmentFile(
    data: TreatmentFileData,
    response: Response,
  ): Promise<StreamableFile> {
    try {
      const { readableStream, fileName } =
        await this.getTreatmentFileReadableStream(data);
      // Pipe the file stream to the response
      readableStream.pipe(response);
      // Set response headers for downloading the file
      response.set({
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      });

      return new StreamableFile(readableStream);
    } catch (error) {
      this.logger.error('Error writing to treatment file:', error);
      throw new BadRequestException('Error writing treatment file');
    }
  }

  async getReadableStreamTreatmentFile(
    treatmentId: string,
    lang: string,
    is_treatment_deleted = false,
  ): Promise<{
    readableStream: ReadStream;
    fileName: string;
    treatmentUserName: string;
  }> {
    const treatment = await this.treatmentsRepo.getTreatmentAndUser(
      treatmentId,
      is_treatment_deleted,
    );

    if (!treatment) {
      throw new NotFoundException(`treatments.treatment_not_found`);
    }
    const treatmentUserName =
      treatment.users.first_name && treatment.users.last_name
        ? `${treatment.users.first_name} ${treatment.users.last_name}`
        : treatment.users.user_name;
    const [
      treatmentDoctors,
      userGoalsWithGoalLevel,
      treatmentAppointments,
      treatmentTimelineNotes,
      termsAndConditionsAndPrivacyPolicy,
    ] = await Promise.all([
      this.treatmentsRepo.getTreatmentDoctors(treatment.id),
      this.treatmentsRepo.getUserGoalsWithGoalLevel(treatment.user_id, lang),
      this.treatmentsRepo.getUserTreatmentAppointments(treatment.id),
      this.treatmentsRepo.getUserTreatmentTimelineNotes(treatment.id),
      this.treatmentsRepo.getTermsAndConditionsAndPrivacyPolicy(lang),
    ]);

    const data: TreatmentFileData = {
      treatment,
      treatmentDoctors,
      userGoalsWithGoalLevel,
      treatmentAppointments,
      treatmentTimelineNotes,
      termsAndConditionsAndPrivacyPolicy,
    };
    try {
      const { readableStream, fileName } =
        await this.getTreatmentFileReadableStream(data);
      return { readableStream, fileName, treatmentUserName };
    } catch (error) {
      this.logger.error('Error getting treatment file readable stream:', error);
      throw new BadRequestException(
        'Error getting treatment file readable stream',
      );
    }
  }

  async sendTreatmentFileEmail(
    treatmentId: string,
    userId: string,
  ): Promise<SendTreatmentFileEmailResponse> {
    const treatment = await this.treatmentsRepo.getTreatmentAndUser(
      treatmentId,
      false,
    );

    if (!treatment) {
      throw new NotFoundException(`treatments.treatment_not_found`);
    }

    this.eventEmitter.emit(
      TreatmentsEvent.TREATMENT_FILE_ATTACHED,
      new TreatmentFileAttachedEvent(treatmentId, userId),
    );
    return { message: this.translationService.translate(`users.email_sent`) };
  }

  async isDigidSessionActive(userId: string): Promise<boolean> {
    const key = this.redisService.getDigidSessionLogKey(userId);
    const data = await this.redisService.get(key);
    return !!data;
  }

  async activeTreatment(userId: string): Promise<ActiveTreatmentResponse> {
    const treatment = await this.treatmentsRepo.getTreatment(userId);

    let showDigidLogin = false;
    let token;

    if (treatment && treatment.treatment_type !== TreatmentType.START_PROGRAM) {
      showDigidLogin = true;
    }

    if (showDigidLogin) {
      const isDigidSessionActive = await this.isDigidSessionActive(userId);
      if (isDigidSessionActive) {
        showDigidLogin = false;
      } else {
        token = await this.authService.getDigidJwtToken(userId);
      }
    }

    /**@deprecated we are using showDigid only */
    const isTreatmentActive =
      !!treatment && treatment.treatment_type !== TreatmentType.START_PROGRAM;
    /**@deprecated we are using showDigid only */
    const isDigidSessionActive = false;

    return {
      showDigidLogin: showDigidLogin,
      token,
      isDigidSessionActive,
      isTreatmentActive,
    };
  }

  async createSignedUpUserTreatment(user: Users): Promise<string> {
    const { invitation_id, email, id: user_id } = user;

    if (!invitation_id) {
      return 'invitation_id not available';
    }
    const invitation = await this.treatmentsRepo.getPatientInvitation(
      invitation_id,
      email,
    );

    if (!invitation) {
      return 'Invitation Not Available';
    }

    const { doctor_id, treatment_option_id, treatment_role } = invitation;

    const treatmentOption = await this.treatmentsRepo.getTreatmentOptionById(
      treatment_option_id,
    );

    await this.addTreatmentAndDoctorTreatment(
      {
        option_id: treatmentOption.id,
        user_id,
        role: treatment_role,
      },
      treatmentOption.treatment_type,
      doctor_id,
      false,
    );

    return `Treatment Created for Registered User.`;
  }
}
