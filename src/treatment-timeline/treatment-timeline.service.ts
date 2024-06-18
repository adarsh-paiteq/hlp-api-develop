import { TreatmentTimelineRepo } from './treatment-timeline.repo';
import { TranslationService } from '@shared/services/translation/translation.service';
import {
  GetStageResponse,
  StageDetail,
  frequencyOrder,
} from './dto/get-stage.dto';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  AddStageInput,
  AddStageResponse,
  InsertStageInput,
  InsertStageMessageInput,
  StageInput,
  StageMessageInput,
  frequencyStageType,
} from './dto/add-stage.dto';
import { Stage, StageType } from './entities/stage.entity';
import { TreatmentOption } from '@treatments/entities/treatment-options.entity';
import { Organisation } from '@organisations/entities/organisations.entity';
import {
  UpdateStageDTO,
  UpdateStageInput,
  UpdateStageResponse,
} from './dto/update-stage.dto';
import {
  AddTreatmentFileInput,
  AddTreatmentFileResponse,
  InsertTreatmentFileInput,
  InsertTreatmentTimeline,
} from './dto/add-treatment-file.dto';
import { ulid } from 'ulid';
import { TimelineAttachmentType } from './entities/treatment-timeline-attachment.entity';
import { FileType } from '@uploads/upload.dto';
import {
  AddTreatmentNoteInput,
  AddTreatmentNoteResponse,
  InsertTreatmentNoteInput,
} from './dto/add-treatment-note.dto';
import {
  ScheduleEntity,
  ScheduleFor,
  ScheduleType,
} from '@schedules/entities/schedule.entity';
import { ToolkitType } from '@toolkits/toolkits.model';
import { DoctorTreatment } from '@treatments/entities/doctor-treatments.entity';
import { TreatmentBuddy } from '@treatments/entities/treatment-buddy.entity';
import {
  StageMessageFrequency,
  StageMessages,
} from './entities/stage-messages.entity';
import { AddUserTreatmentNoteInput } from './dto/add-user-treatment-note.dto';
import {
  GetTreatmentTimelineInput,
  GetTreatmentTimelineResponse,
  TreatementTimelineMessage,
} from './dto/get-treatment-timeline.dto';
import { UserRoles } from '@users/users.dto';
import { TreatmentTimeline } from './entities/treatment-timeline.entity';
import { SchedulesService } from '@schedules/schedules.service';
import {
  DefaultTimelineMessageData,
  TreatmentWithUserDTO,
  frequencyDurations,
} from './dto/treatment-timeline.dto';
import { DateTime } from 'luxon';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  DefaultTimelineMessageAddedEvent,
  DefaultTimelineMessageEvent,
  StageUpdatedEvent,
  ToolkitTimelineMessageAddedEvent,
  TreatmentTimelineAddedEvent,
  TreatmentTimelineEvent,
  TreatmentTimelineFileAddedEvent,
  TreatmentTimelineNoteAddedEvent,
} from './treatment-timeline.event';
import { TreatmentTimelineMessageQueue } from './treatment-timeline-message.queue';
import { TreatmentRoles } from '@treatments/dto/add-treatment.dto';
import { SaveScheduleInput } from '@schedules/dto/create-schedule.dto';
import { v4 as uuidv4 } from 'uuid';
import { getUTCDate } from '@utils/util';
import { AppointmentType } from '@toolkits/entities/user-appointment.entity';
import {
  UpdateTreatmentTimelineNoteInput,
  UpdateTreatmentTimelineNoteResponse,
} from './dto/edit-treatment-timeline-note.dto';
import {
  DeleteTreatmentTimelineMessageArgs,
  DeleteTreatmentTimelineMessageResponse,
} from './dto/delete-treatment-timeline-message.dto';
import { UtilsService } from '@utils/utils.service';
import { Schedule } from '@schedules/schedules.model';
import {
  UpdateTreatmentTimelineFileInput,
  UpdateTreatmentTimelineFileResponse,
} from './dto/edit-treatment-timeline-file.dto';

@Injectable()
export class TreatmentTimelineService {
  private readonly logger = new Logger(TreatmentTimelineService.name);
  constructor(
    private readonly treatmentTimelineRepo: TreatmentTimelineRepo,
    private readonly translationService: TranslationService,
    private readonly schedulesService: SchedulesService,
    private readonly eventEmitter: EventEmitter2,
    private readonly treatmentTimelineMessageQueue: TreatmentTimelineMessageQueue,
    private readonly utilsService: UtilsService,
  ) {}

  async getStage(stageId: string, lang: string): Promise<GetStageResponse> {
    const stageWithStageMessages = await this.treatmentTimelineRepo.getStage(
      stageId,
    );
    if (!stageWithStageMessages) {
      throw new NotFoundException(`treatment-timeline.stage_not_found`);
    }
    stageWithStageMessages.stage_messages.sort((a, b) => {
      const frequencyA = a.frequency || StageMessageFrequency.AT_BEGINNING;
      const frequencyB = b.frequency || StageMessageFrequency.AT_BEGINNING;
      return (
        (frequencyOrder.get(frequencyA) || 0) -
        (frequencyOrder.get(frequencyB) || 0)
      );
    });
    const { organisations, treatment_options, ...stage } =
      stageWithStageMessages;

    let translatedTreatmentOption;
    if (treatment_options) {
      [translatedTreatmentOption] =
        this.translationService.getTranslations<TreatmentOption>(
          [treatment_options],
          ['title'],
          lang,
        );
    }

    const [translatedOrganisation] =
      this.translationService.getTranslations<Organisation>(
        [organisations],
        ['name'],
        lang,
      );

    const stageDetail: StageDetail = {
      ...stage,
      organisation_name: translatedOrganisation.name,
      treatment_option_name: translatedTreatmentOption?.title,
    };

    return { stageDetail };
  }

  private validateCreateStageInput(input: StageInput): StageInput {
    const { age_group, stage_type, treatment_option_id } = input;

    const insertStageInput: StageInput = {
      ...input,
    };

    if (age_group && stage_type === StageType.GROUP) {
      throw new NotFoundException(`treatment-timeline.age_group_not_required`);
    }

    if (treatment_option_id && stage_type === StageType.GROUP) {
      throw new NotFoundException(
        `treatment-timeline.treatment_option_id_not_required`,
      );
    }
    return insertStageInput;
  }

  private validateCreateStageMessageInputs(
    savedType: StageType,
    input: StageMessageInput[],
  ): StageMessageInput[] {
    const isFrequencyStageType = frequencyStageType.includes(savedType);

    if (!isFrequencyStageType && input.length > 1) {
      throw new BadRequestException(
        `treatment-timeline.stage_messages_required_one_element`,
      );
    }

    const createStageMessageInputs = input.map((stageMessageInput) => {
      const { translations, frequency, toolkit_id, sort_order } =
        stageMessageInput;

      const insertStageMessageInput: StageMessageInput = {
        translations,
      };

      if (isFrequencyStageType) {
        if (!frequency) {
          throw new NotFoundException(`treatment-timeline.frequency_required`);
        }
        if (!toolkit_id) {
          throw new NotFoundException(`treatment-timeline.toolkit_id_required`);
        }
        if (!sort_order) {
          throw new NotFoundException(`treatment-timeline.sort_order_required`);
        }
        insertStageMessageInput.frequency = frequency;
        insertStageMessageInput.toolkit_id = toolkit_id;
        insertStageMessageInput.sort_order = sort_order;
      }
      return insertStageMessageInput;
    });
    return createStageMessageInputs;
  }

  async addStage(
    adminId: string,
    input: AddStageInput,
  ): Promise<AddStageResponse> {
    const { stage_messages, ...stageInput } = input;
    const { age_group, organisation_id, stage_type, treatment_option_id } =
      stageInput;

    const insertStageInput = this.validateCreateStageInput(stageInput);
    const insertStageMessageInput = this.validateCreateStageMessageInputs(
      stage_type,
      stage_messages,
    );
    const toolkitIds = insertStageMessageInput
      .map((message) => message.toolkit_id)
      .filter((toolkitId) => toolkitId !== undefined) as string[];

    if (toolkitIds.length > 0) {
      const uniqueToolkitsIds = [...new Set(toolkitIds)];
      const count = await this.treatmentTimelineRepo.getToolkitCount(
        uniqueToolkitsIds,
      );
      if (uniqueToolkitsIds.length !== count) {
        throw new NotFoundException(`toolkits.toolkit_not_found`);
      }
    }
    const stage = await this.treatmentTimelineRepo.getExistingStage(
      stage_type,
      organisation_id,
      treatment_option_id,
      age_group,
    );

    if (stage) {
      throw new BadRequestException(
        `treatment-timeline.treatment_timeline_already_exist`,
      );
    }
    const stageInputData: InsertStageInput = {
      ...insertStageInput,
      created_by: adminId,
      updated_by: adminId,
    };
    const savedStage = await this.treatmentTimelineRepo.insertStage(
      stageInputData,
    );

    const insertStageMessageInputs: InsertStageMessageInput[] =
      insertStageMessageInput.map((messageInput) => {
        return {
          ...messageInput,
          translations: `${JSON.stringify(messageInput.translations)}`,
          stage_id: savedStage.id,
          created_by: adminId,
          updated_by: adminId,
        };
      });
    await this.treatmentTimelineRepo.insertStageMessage(
      insertStageMessageInputs,
    );
    return {
      message: this.translationService.translate(
        `treatment-timeline.stage_added_successfully`,
      ),
    };
  }

  async updateStage(
    adminId: string,
    input: UpdateStageInput,
  ): Promise<UpdateStageResponse> {
    const { stageId, stage: stageArgs } = input;
    const { stage_messages, ...stageInput } = stageArgs;
    const { age_group, organisation_id, stage_type, treatment_option_id } =
      stageInput;
    const stage = await this.treatmentTimelineRepo.getStageById(stageId);

    if (!stage) {
      throw new BadRequestException(`treatment-timeline.stage_not_found`);
    }
    if (stage.stage_type !== input.stage.stage_type) {
      throw new BadRequestException(
        `treatment-timeline.stage_type_can_not_be_changed`,
      );
    }
    const updateStageInput = this.validateCreateStageInput(stageInput);
    const updateStageMessageInput = this.validateCreateStageMessageInputs(
      stage_type,
      stage_messages,
    );

    const toolkitIds = updateStageMessageInput
      .map((message) => message.toolkit_id)
      .filter((toolkitId) => toolkitId !== undefined) as string[];

    if (toolkitIds.length > 0) {
      const uniqueToolkitsIds = [...new Set(toolkitIds)];
      const count = await this.treatmentTimelineRepo.getToolkitCount(
        uniqueToolkitsIds,
      );
      if (uniqueToolkitsIds.length !== count) {
        throw new NotFoundException(`toolkits.toolkit_not_found`);
      }
    }
    const existingStage = await this.treatmentTimelineRepo.getExistingStage(
      stage_type,
      organisation_id,
      treatment_option_id,
      age_group,
      stageId,
    );

    if (existingStage) {
      throw new BadRequestException(
        `treatment-timeline.treatment_timeline_already_exist`,
      );
    }
    const stageUpdateData: UpdateStageDTO = {
      ...updateStageInput,
      updated_by: adminId,
    };

    const stageMessages = await this.treatmentTimelineRepo.getStageMessageById(
      stageId,
    );
    const updateStageMessageIds = stageMessages.map((stageMessages) => {
      const matchedStageMessages = input.stage.stage_messages.filter(
        (stageMessage) => stageMessage.stage_message_id === stageMessages.id,
      );
      const [stageMessageId] = matchedStageMessages.map(
        (stageMessage) => stageMessage.stage_message_id,
      );
      return stageMessageId;
    });
    const deleteStageMessageIds = stageMessages.map((stageMessages) => {
      const hasMatch = input.stage.stage_messages.some(
        (inputMessage) => inputMessage.stage_message_id === stageMessages.id,
      );
      if (!hasMatch) {
        return stageMessages.id;
      }
    });

    const stageMessagesWithoutId = input.stage.stage_messages.filter(
      (message) => !message.stage_message_id,
    );
    const insertStageMessageInputs: InsertStageMessageInput[] =
      stageMessagesWithoutId.map((messageInput) => {
        return {
          ...messageInput,
          translations: `${JSON.stringify(messageInput.translations)}`,
          stage_id: stageId,
          updated_by: adminId,
          created_by: adminId,
        };
      });

    if (stage_type === StageType.GROUP) {
      await this.treatmentTimelineRepo.updateStageById(stageId, {
        age_group: null,
        treatment_option_id: null,
      });
    }
    const updatedStage = await this.treatmentTimelineRepo.updateStageById(
      stageId,
      stageUpdateData,
    );

    updateStageMessageIds.forEach(async (stageMessageId) => {
      if (stageMessageId) {
        const [data] = input.stage.stage_messages.filter(
          (message) => message.stage_message_id === stageMessageId,
        );
        const updateStageMessagesInput = {
          sort_order: data.sort_order,
          toolkit_id: data.toolkit_id,
          translations: `${JSON.stringify(data.translations)}`,
          stage_id: stageId,
          updated_by: adminId,
        };
        if (
          input.stage.stage_type !== StageType.DEFAULT &&
          input.stage.stage_type !== StageType.EXPERIENCE_EXPERT
        ) {
          updateStageMessagesInput.sort_order = undefined;
          updateStageMessagesInput.toolkit_id = undefined;
        } else {
          updateStageMessagesInput.sort_order = data.sort_order;
          updateStageMessagesInput.toolkit_id = data.toolkit_id;
        }
        if (data && data.stage_message_id === stageMessageId) {
          await this.treatmentTimelineRepo.updateStageMessageById(
            stageMessageId,
            updateStageMessagesInput,
          );
        }
      }
    });

    deleteStageMessageIds.forEach(async (stageMessageId) => {
      if (stageMessageId && stageMessageId.length) {
        await this.treatmentTimelineRepo.deleteStageMessage(stageMessageId);
      }
    });

    if (stageMessagesWithoutId.length > 0) {
      await this.treatmentTimelineRepo.insertStageMessage(
        insertStageMessageInputs,
      );
    }

    this.eventEmitter.emit(
      TreatmentTimelineEvent.STAGE_UPDATED,
      new StageUpdatedEvent(updatedStage),
    );

    return {
      message: this.translationService.translate(
        `treatment-timeline.stage_updated_successfully`,
      ),
    };
  }

  async validateFileTypeInput(input: AddTreatmentFileInput): Promise<void> {
    const {
      thumbnail_image_id,
      thumbnail_image_path,
      thumbnail_image_url,
      file_type,
    } = input;
    if (thumbnail_image_id && file_type !== FileType.VIDEO) {
      throw new NotFoundException(
        `treatment-timeline.thumbnail_image_id_not_required`,
      );
    }

    if (thumbnail_image_path && file_type !== FileType.VIDEO) {
      throw new NotFoundException(
        `treatment-timeline.thumbnail_image_path_not_required`,
      );
    }
    if (thumbnail_image_url && file_type !== FileType.VIDEO) {
      throw new NotFoundException(
        `treatment-timeline.thumbnail_image_url_not_required`,
      );
    }
  }

  async addTreatmentFile(
    loggedInUserId: string,
    input: AddTreatmentFileInput,
    userId: string,
  ): Promise<AddTreatmentFileResponse> {
    await this.validateFileTypeInput(input);
    const treatment = await this.treatmentTimelineRepo.getTreatmentUser(userId);
    if (!treatment) {
      throw new NotFoundException(`treatments.treatment_not_found`);
    }
    const { age_group, organization_id, treatment_option_id, treatment_id } =
      treatment;
    const stageWithMessage =
      await this.treatmentTimelineRepo.getStageWithMessage(
        StageType.FILE,
        organization_id,
        treatment_option_id,
        age_group,
      );
    if (!stageWithMessage) {
      throw new BadRequestException(
        'treatment-timeline.stage_message_not_configured',
      );
    }
    const insertTreatmentFile: InsertTreatmentFileInput = {
      ...input,
      id: ulid(),
      type: TimelineAttachmentType.FILE,
      created_by: loggedInUserId,
    };
    const savedTreatmentFile =
      await this.treatmentTimelineRepo.insertTreatmentFile(insertTreatmentFile);
    const { id: attachementId } = savedTreatmentFile;
    const insertTreatmentTimelineInput: InsertTreatmentTimeline[] =
      stageWithMessage.stage_messages.map((stageMessage) => {
        return {
          user_id: userId,
          attachment_id: attachementId,
          stage_message_id: stageMessage.id,
          stage_type: StageType.FILE,
          treatment_id: treatment_id,
          id: ulid(),
        };
      });
    await this.treatmentTimelineRepo.insertTreatmentTimeline(
      insertTreatmentTimelineInput,
    );
    this.eventEmitter.emit(
      TreatmentTimelineEvent.FILE_ADDED_IN_TREATMENT_TIMELINE,
      new TreatmentTimelineFileAddedEvent(userId, savedTreatmentFile),
    );
    return {
      message: this.translationService.translate(
        `treatment-timeline.treatment_file_added_successfully`,
      ),
    };
  }

  async validateNoteTypeInput(input: AddTreatmentNoteInput): Promise<void> {
    const {
      thumbnail_image_id,
      thumbnail_image_path,
      thumbnail_image_url,
      file_type,
      file_url,
      file_path,
      file_id,
    } = input;

    if (!file_type) {
      if (file_url) {
        throw new NotFoundException(`treatment-timeline.file_url_not_required`);
      }
      if (file_path) {
        throw new NotFoundException(
          `treatment-timeline.file_path_not_required`,
        );
      }
      if (file_id) {
        throw new NotFoundException(`treatment-timeline.file_id_not_required`);
      }
    }

    if (thumbnail_image_id && file_type !== FileType.VIDEO) {
      throw new NotFoundException(
        `treatment-timeline.thumbnail_image_id_not_required`,
      );
    }

    if (thumbnail_image_path && file_type !== FileType.VIDEO) {
      throw new NotFoundException(
        `treatment-timeline.thumbnail_image_path_not_required`,
      );
    }
    if (thumbnail_image_url && file_type !== FileType.VIDEO) {
      throw new NotFoundException(
        `treatment-timeline.thumbnail_image_url_not_required`,
      );
    }
  }
  async addTreatmentNote(
    loggedInUserId: string,
    input: AddTreatmentNoteInput | AddUserTreatmentNoteInput,
    userId: string,
  ): Promise<AddTreatmentNoteResponse> {
    await this.validateNoteTypeInput(input);
    const treatment = await this.treatmentTimelineRepo.getTreatmentUser(userId);
    if (!treatment) {
      throw new NotFoundException(`treatments.treatment_not_found`);
    }
    const { age_group, organization_id, treatment_option_id, treatment_id } =
      treatment;
    const stageWithMessage =
      await this.treatmentTimelineRepo.getStageWithMessage(
        StageType.NOTE,
        organization_id,
        treatment_option_id,
        age_group,
      );
    if (!stageWithMessage) {
      throw new BadRequestException(
        'treatment-timeline.stage_message_not_configured',
      );
    }
    const insertTreatmentNote: InsertTreatmentNoteInput = {
      ...input,
      id: ulid(),
      type: TimelineAttachmentType.NOTE,
      created_by: loggedInUserId,
    };
    const savedTreatmentNote =
      await this.treatmentTimelineRepo.insertTreatmentNote(insertTreatmentNote);
    const { id: attachementId } = savedTreatmentNote;
    const insertTreatmentTimelineInput: InsertTreatmentTimeline[] =
      stageWithMessage.stage_messages.map((stageMessage) => {
        return {
          user_id: userId,
          attachment_id: attachementId,
          stage_message_id: stageMessage.id,
          stage_type: StageType.NOTE,
          treatment_id: treatment_id,
          id: ulid(),
        };
      });
    await this.treatmentTimelineRepo.insertTreatmentTimeline(
      insertTreatmentTimelineInput,
    );
    this.eventEmitter.emit(
      TreatmentTimelineEvent.NOTE_ADDED_IN_TREATMENT_TIMELINE,
      new TreatmentTimelineNoteAddedEvent(userId, savedTreatmentNote),
    );

    return {
      message: this.translationService.translate(
        `treatment-timeline.treatment_note_added_successfully`,
      ),
    };
  }

  async addCoachTimelineMessage(
    doctorTreatment: DoctorTreatment,
  ): Promise<string> {
    const treatment = await this.treatmentTimelineRepo.getTreatmentWithUser(
      doctorTreatment.treatment_id,
    );
    if (!treatment) {
      return `Treatment Not Found`;
    }
    const { age_group, organization_id, treatment_option_id, treatment_id } =
      treatment;
    const stageWithMessage =
      await this.treatmentTimelineRepo.getStageWithMessage(
        StageType.COACHES,
        organization_id,
        treatment_option_id,
        age_group,
      );

    if (!stageWithMessage) {
      return `Coach Stage Message Not Configured`;
    }
    const insertTreatmentTimelineInput: InsertTreatmentTimeline[] =
      stageWithMessage.stage_messages.map((stageMessage) => {
        return {
          user_id: treatment.user_id,
          stage_message_id: stageMessage.id,
          stage_type: StageType.COACHES,
          treatment_id: treatment_id,
          treatment_team_member_id: doctorTreatment.doctor_id,
          treatment_doctor_role: doctorTreatment.role,
          id: ulid(),
        };
      });
    await this.treatmentTimelineRepo.insertTreatmentTimeline(
      insertTreatmentTimelineInput,
    );
    return 'Treatment Timeline Coach Added Successfully';
  }

  async prepareInputsAndInsertTreatmentTimeline(
    stageMessages: StageMessages[],
    userId: string,
    treatmentId: string,
    stageType: StageType,
    scheduleId?: string,
  ): Promise<TreatmentTimeline[]> {
    const insertTreatmentTimelineInput: InsertTreatmentTimeline[] =
      stageMessages.map((stageMessage) => {
        const message: InsertTreatmentTimeline = {
          id: ulid(),
          user_id: userId,
          stage_message_id: stageMessage.id,
          stage_type: stageType,
          treatment_id: treatmentId,
        };
        if (scheduleId) {
          message.schedule_id = scheduleId;
        }

        return message;
      });

    const treatmentTimeline =
      await this.treatmentTimelineRepo.insertTreatmentTimeline(
        insertTreatmentTimelineInput,
      );
    return treatmentTimeline;
  }

  async addActivityTimelineMessage(
    treatmentId: string,
    scheduleId: string,
  ): Promise<string> {
    const treatment = await this.treatmentTimelineRepo.getTreatmentWithUser(
      treatmentId,
    );

    if (!treatment) {
      return 'Treatment not found';
    }

    const {
      treatment_option_id,
      organization_id,
      age_group,
      user_id: userId,
      treatment_id,
    } = treatment;

    const stageType = StageType.ACTIVITY;
    const stageWithMessage =
      await this.treatmentTimelineRepo.getStageWithMessage(
        stageType,
        organization_id,
        treatment_option_id,
        age_group,
      );

    if (!stageWithMessage) {
      return `${stageType} Message Not Configured`;
    }

    await this.prepareInputsAndInsertTreatmentTimeline(
      stageWithMessage.stage_messages,
      userId,
      treatment_id,
      stageType,
      scheduleId,
    );
    return `${stageType} Stage Message added in Treatment Timeline`;
  }
  async addAppointmentTimelineMessage(
    treatmentId: string,
    scheduleId: string,
    appointment_id: string,
    user: string,
  ): Promise<string> {
    const [treatment, appointment] = await Promise.all([
      this.treatmentTimelineRepo.getTreatmentWithUser(treatmentId),
      this.treatmentTimelineRepo.getAppointmentWithUser(appointment_id, user),
    ]);
    if (!treatment) {
      return 'Treatment not found';
    }
    if (!appointment) {
      return 'Appointment not found';
    }
    const {
      treatment_option_id,
      organization_id,
      age_group,
      user_id: userId,
      treatment_id,
    } = treatment;
    let stageType;
    if (appointment.appointment_type === AppointmentType.INTAKE) {
      stageType = StageType.INTAKE_APPOINTMENT;
    } else if (appointment.appointment_type === AppointmentType.RESEARCH) {
      stageType = StageType.RESEARCH_APPOINTMENT;
    } else {
      stageType = StageType.OTHER_APPOINTMENT;
    }
    if (!stageType) {
      return 'Stage Not Found';
    }
    const stageWithMessage =
      await this.treatmentTimelineRepo.getStageWithMessage(
        stageType,
        organization_id,
        treatment_option_id,
        age_group,
      );

    if (!stageWithMessage) {
      return `${stageType} Message Not Configured`;
    }

    const savedAppointmentTimeline =
      await this.prepareInputsAndInsertTreatmentTimeline(
        stageWithMessage.stage_messages,
        userId,
        treatment_id,
        stageType,
        scheduleId,
      );
    savedAppointmentTimeline.forEach((timelineMessage) => {
      this.eventEmitter.emit(
        TreatmentTimelineEvent.APPOINTMENT_ADDED_IN_TREATMENT_TIMELINE,
        new TreatmentTimelineAddedEvent(timelineMessage),
      );
    });

    return `${stageType} Stage Message added in Treatment Timeline`;
  }
  async addToolkitTimelineMessage(
    treatmentId: string,
    scheduleId: string,
  ): Promise<string> {
    const treatment = await this.treatmentTimelineRepo.getTreatmentWithUser(
      treatmentId,
    );
    if (!treatment) {
      return 'Treatment not found';
    }
    const {
      treatment_option_id,
      organization_id,
      age_group,
      user_id: userId,
    } = treatment;
    const stageWithMessage =
      await this.treatmentTimelineRepo.getStageWithMessage(
        StageType.TOOL_KIT,
        organization_id,
        treatment_option_id,
        age_group,
      );
    if (!stageWithMessage) {
      return `Toolkit Treatement Timeline not configured`;
    }

    const insertTreatmentTimelineInput: InsertTreatmentTimeline[] =
      stageWithMessage.stage_messages.map((stageMessage) => {
        return {
          user_id: userId,
          stage_message_id: stageMessage.id,
          stage_type: StageType.TOOL_KIT,
          treatment_id: treatmentId,
          schedule_id: scheduleId,
          id: ulid(),
        };
      });
    const treatmentTimelines =
      await this.treatmentTimelineRepo.insertTreatmentTimeline(
        insertTreatmentTimelineInput,
      );
    treatmentTimelines.forEach((treatmentTimeline) => {
      this.eventEmitter.emit(
        TreatmentTimelineEvent.TOOL_KIT_TIMELINE_MESSAGE_ADDED,
        new ToolkitTimelineMessageAddedEvent(treatmentTimeline),
      );
    });

    return `Toolkit Treatement Timeline Added for ${scheduleId}`;
  }

  async addBuddyTimelineMessage(
    treatmentBuddy: TreatmentBuddy,
  ): Promise<string> {
    const { user_id: buddyId } = treatmentBuddy;
    const buddy = await this.treatmentTimelineRepo.getBuddyWithTreatment(
      treatmentBuddy.treatment_id,
    );
    if (!buddy) {
      return `Buddy Not Found`;
    }
    const treatment = await this.treatmentTimelineRepo.getTreatmentWithUser(
      treatmentBuddy.treatment_id,
    );
    if (!treatment) {
      return `Treatment Not Found`;
    }
    const { age_group, organization_id, treatment_option_id, treatment_id } =
      treatment;
    const stageWithMessage =
      await this.treatmentTimelineRepo.getStageWithMessage(
        StageType.BUDDY,
        organization_id,
        treatment_option_id,
        age_group,
      );
    if (!stageWithMessage) {
      return `Buudy Stage Message Not Configured`;
    }
    const insertTreatmentTimelineInput: InsertTreatmentTimeline[] =
      stageWithMessage.stage_messages.map((stageMessage) => {
        return {
          user_id: treatment.user_id,
          stage_message_id: stageMessage.id,
          stage_type: StageType.BUDDY,
          treatment_id: treatment_id,
          treatment_team_member_id: buddyId,
          id: ulid(),
        };
      });
    await this.treatmentTimelineRepo.insertTreatmentTimeline(
      insertTreatmentTimelineInput,
    );
    return 'Treatment Timeline Buddy Added Successfully';
  }

  async addSleepCheckTimelineMessage(
    treatmentId: string,
    scheduleId: string,
  ): Promise<string> {
    const treatment = await this.treatmentTimelineRepo.getTreatmentWithUser(
      treatmentId,
    );
    if (!treatment) {
      return 'Treatment not found';
    }
    const {
      treatment_option_id,
      organization_id,
      age_group,
      user_id: userId,
      treatment_id,
    } = treatment;
    let stageWithMessage;
    stageWithMessage = await this.treatmentTimelineRepo.getStageWithMessage(
      StageType.SLEEP_CHECK,
      organization_id,
      treatment_option_id,
      age_group,
    );
    if (!stageWithMessage) {
      stageWithMessage = await this.treatmentTimelineRepo.getStageWithMessage(
        StageType.TOOL_KIT,
        organization_id,
        treatment_option_id,
        age_group,
      );
      if (!stageWithMessage) {
        return `Toolkit Stage Message Not Configured`;
      }
    }
    const { stage_messages, stage_type } = stageWithMessage;
    const insertTreatmentTimelineInput: InsertTreatmentTimeline[] =
      stage_messages.map((stageMessage) => {
        return {
          user_id: userId,
          stage_message_id: stageMessage.id,
          stage_type: stage_type,
          schedule_id: scheduleId,
          treatment_id: treatment_id,
          id: ulid(),
        };
      });
    await this.treatmentTimelineRepo.insertTreatmentTimeline(
      insertTreatmentTimelineInput,
    );
    return `${stage_type} Treatement Timeline Added for ${scheduleId}`;
  }

  async addFormTimelineMessage(
    treatmentId: string,
    scheduleId: string,
  ): Promise<string> {
    const treatment = await this.treatmentTimelineRepo.getTreatmentWithUser(
      treatmentId,
    );
    if (!treatment) {
      return 'Treatment not found';
    }
    const {
      treatment_option_id,
      organization_id,
      age_group,
      user_id: userId,
      treatment_id,
    } = treatment;
    let stageWithMessage;
    stageWithMessage = await this.treatmentTimelineRepo.getStageWithMessage(
      StageType.FORMS,
      organization_id,
      treatment_option_id,
      age_group,
    );
    if (!stageWithMessage) {
      stageWithMessage = await this.treatmentTimelineRepo.getStageWithMessage(
        StageType.TOOL_KIT,
        organization_id,
        treatment_option_id,
        age_group,
      );
      if (!stageWithMessage) {
        return 'Toolkit Stage Message Not Configured';
      }
    }
    const { stage_messages, stage_type } = stageWithMessage;
    const insertTreatmentTimelineInput: InsertTreatmentTimeline[] =
      stage_messages.map((stageMessage) => {
        return {
          user_id: userId,
          stage_message_id: stageMessage.id,
          stage_type: stage_type,
          schedule_id: scheduleId,
          treatment_id: treatment_id,
          id: ulid(),
        };
      });
    const savedFormTimeline =
      await this.treatmentTimelineRepo.insertTreatmentTimeline(
        insertTreatmentTimelineInput,
      );
    savedFormTimeline.forEach((timelineMessage) => {
      this.eventEmitter.emit(
        TreatmentTimelineEvent.FORM_ADDED_IN_TREATMENT_TIMELINE,
        new TreatmentTimelineAddedEvent(timelineMessage),
      );
    });
    return `${stage_type} Treatment Timeline Added for ${scheduleId}`;
  }

  /**
   * @description This function is used for adding treatment Timeline messages of specific types:
   * `StageType.FORMS`, `StageType.TOOL_KIT`, `StageType.SLEEP_CHECK`, and `StageType.ACTIVITY`.
   */
  async addScheduleTimelineMessage(schedule: ScheduleEntity): Promise<string> {
    const {
      schedule_for,
      treatment_id,
      id: scheduleId,
      tool_kit,
      created_by,
      user_appointment_id,
      user,
    } = schedule;

    const scheduleCreatedByUser = await this.treatmentTimelineRepo.getUserById(
      <string>created_by,
    );

    if (!scheduleCreatedByUser) {
      return 'Invalid Schedule Created By User';
    }

    if (
      schedule_for !== ScheduleFor.USER_TOOLKIT &&
      scheduleCreatedByUser.role === UserRoles.USER
    ) {
      return 'Timeline Message cant be added if USER created the schedule';
    }

    // If ScheduleFor is USER_TOOLKIT we send Activity stage message
    if (schedule_for === ScheduleFor.USER_TOOLKIT && treatment_id) {
      return await this.addActivityTimelineMessage(treatment_id, scheduleId);
    }

    if (
      schedule_for === ScheduleFor.APPOINTMENT &&
      treatment_id &&
      user_appointment_id &&
      user
    ) {
      return await this.addAppointmentTimelineMessage(
        treatment_id,
        scheduleId,
        user_appointment_id,
        user,
      );
    }
    if (schedule_for === ScheduleFor.TOOL_KIT && tool_kit && treatment_id) {
      const toolKit = await this.treatmentTimelineRepo.getToolkitById(tool_kit);
      if (!created_by) {
        return 'CreatedBy not found';
      }
      const user = await this.treatmentTimelineRepo.getUserById(created_by);
      if (user.role === UserRoles.USER) {
        return 'User not created Treatment Timeline';
      }
      const { tool_kit_type } = toolKit;
      if (tool_kit_type === ToolkitType.SLEEP_CHECK) {
        return await this.addSleepCheckTimelineMessage(
          treatment_id,
          scheduleId,
        );
      } else if (tool_kit_type === ToolkitType.FORM) {
        return await this.addFormTimelineMessage(treatment_id, scheduleId);
      } else {
        return await this.addToolkitTimelineMessage(treatment_id, scheduleId);
      }
    }
    return `Treatment not found in ${scheduleId}`;
  }

  getStageMessageFrequencyDelay(
    frequency: StageMessageFrequency,
    date: Date,
  ): number {
    const duration = frequencyDurations[frequency];
    const startDate = DateTime.fromJSDate(date).toUTC();
    const endDate = startDate.plus(duration);
    const delayMilliseconds = endDate.diffNow().milliseconds;

    const currentDate = DateTime.now().toUTC();
    const delayBetweenDates = currentDate.diff(startDate).milliseconds;

    if (delayMilliseconds < delayBetweenDates) {
      return 0;
    }

    return delayMilliseconds;
  }

  async getSortedFilteredDefaultStageMessages(
    treatmentId: string,
    stageType: StageType,
  ): Promise<{
    message?: string;
    sortedFilteredStageMessages: StageMessages[];
    treatment?: TreatmentWithUserDTO;
  }> {
    const treatment = await this.treatmentTimelineRepo.getTreatmentWithUser(
      treatmentId,
    );

    if (!treatment) {
      return {
        message: `Treatment Not Found`,
        sortedFilteredStageMessages: [],
      };
    }

    if (
      stageType !== StageType.DEFAULT &&
      stageType !== StageType.EXPERIENCE_EXPERT
    ) {
      return {
        message: `Invalid stage type ${stageType}`,
        sortedFilteredStageMessages: [],
      };
    }

    const { age_group, organization_id, treatment_option_id } = treatment;

    const stageWithMessage =
      await this.treatmentTimelineRepo.getStageWithMessage(
        stageType,
        organization_id,
        treatment_option_id,
        age_group,
      );

    if (!stageWithMessage) {
      return {
        message: `${stageType} Stage Messages not configured from Admin CMS`,
        sortedFilteredStageMessages: [],
      };
    }

    const { stage_message_ids: completedStageMessageIds } =
      await this.treatmentTimelineRepo.getCompletedStageMessageIds(
        treatmentId,
        stageType,
      );

    const { stage_messages } = stageWithMessage;
    const stageMessageFrequencyArray = Object.values(StageMessageFrequency);

    // Create a map to store the index of each frequency value
    const frequencyIndexMap: { [key: string]: number } = {};
    stageMessageFrequencyArray.forEach((frequency, index) => {
      frequencyIndexMap[frequency] = index;
    });

    // Sort the messages based on the frequency indices and exclude already added stage messages
    const sortedFilteredStageMessages = stage_messages
      .filter((message) => !completedStageMessageIds.includes(message.id))
      .sort((a, b) => {
        const frequencyIndexA =
          frequencyIndexMap[a.frequency as StageMessageFrequency];
        const frequencyIndexB =
          frequencyIndexMap[b.frequency as StageMessageFrequency];
        return frequencyIndexA - frequencyIndexB;
      });

    return {
      sortedFilteredStageMessages,
      treatment,
    };
  }

  /**
   * @description This Function is used to check the Next Frequency Treatment Timeline messages of specific stage type
   * @enum {StageType}:`StageType.DEFAULT` and `StageType.EXPERIENCE_EXPERT`,
   * Unless custom frequency is provided, It will check for the next frequency @enum {StageMessageFrequency}
   */
  async checkDefaultTreatmentTimelineMessage(
    payload: DefaultTimelineMessageData,
  ): Promise<string> {
    const {
      stageType,
      treatmentId,
      frequency: inputFrequency,
      userId,
      doctorId,
    } = payload;

    const { sortedFilteredStageMessages, message, treatment } =
      await this.getSortedFilteredDefaultStageMessages(treatmentId, stageType);

    if (message) {
      return message;
    }

    let responseMessage = `No Frequency stage Messages avaialbe for ${stageType}`;
    if (!sortedFilteredStageMessages.length || !treatment) {
      return responseMessage;
    }

    let delay = 0;
    let frequency = inputFrequency;

    if (!frequency) {
      for (const message of sortedFilteredStageMessages) {
        delay = this.getStageMessageFrequencyDelay(
          message.frequency as StageMessageFrequency,
          treatment.treatment_start_date,
        );

        if (delay) {
          frequency = message.frequency;
          break; // Exit the loop if delay is found
        }
      }
    }

    if (!frequency) {
      this.logger.warn(`${stageType}: Next Frequency not found`);
      return `${stageType}: Next Frequency not found`;
    }

    if (!delay && frequency !== StageMessageFrequency.AT_BEGINNING) {
      this.logger.log(
        `${stageType}:${frequency} For this frequency the days already passed `,
      );
      return `${stageType}:${frequency} For this frequency the days already passed `;
    }

    const frequencyStageMessages = sortedFilteredStageMessages.filter(
      (stageMessage) => stageMessage.frequency === frequency,
    );

    if (!frequencyStageMessages.length) {
      this.logger.warn(`${stageType}: Next Frequency not found`);
      return `${stageType}: Next Frequency not found`;
    }

    const jobPayload = {
      treatmentId,
      userId,
      doctorId,
      stageId: frequencyStageMessages[0].stage_id,
      stageType,
      frequency,
      frequencyStageMessages,
    };

    this.eventEmitter.emit(
      TreatmentTimelineEvent.DEFAULT_STAGE_MESSAGE_FOUND,
      new DefaultTimelineMessageEvent(jobPayload, delay),
    );

    responseMessage = `${stageType}: ${frequency} Treatment Timeline Messages Found, adding job to add stage message into treatment timeline`;

    return responseMessage;
  }

  async addDefaultTreatmentTimelineMessages(
    payload: DefaultTimelineMessageData,
  ): Promise<string> {
    const { stageType, treatmentId, userId, doctorId, frequencyStageMessages } =
      payload;

    if (!frequencyStageMessages || !frequencyStageMessages.length) {
      return `Stage mesasges not found`;
    }

    const insertTreatmentTimelineInput: InsertTreatmentTimeline[] = [];

    const scheduleInput: SaveScheduleInput[] = [];

    frequencyStageMessages.forEach((stageMessage) => {
      const scheduleId = uuidv4();

      const schedule: SaveScheduleInput = {
        id: scheduleId,
        repeat_per_day: 1,
        created_by: doctorId,
        schedule_for: ScheduleFor.TOOL_KIT,
        schedule_type: ScheduleType.ONE_TIME,
        show_reminder: false,
        start_date: getUTCDate(new Date()),
        user: userId,
        tool_kit: stageMessage.toolkit_id,
        treatment_id: treatmentId,
      };

      const message: InsertTreatmentTimeline = {
        id: ulid(),
        user_id: userId,
        stage_message_id: stageMessage.id,
        stage_type: stageType,
        treatment_id: treatmentId,
        schedule_id: scheduleId,
      };

      insertTreatmentTimelineInput.push(message);
      scheduleInput.push(schedule);
    });
    //sequence to save the schedules and treatment timeline Messages is important, save schedule first.
    await this.treatmentTimelineRepo.saveSchedule(scheduleInput);

    const treatmentTimeline =
      await this.treatmentTimelineRepo.insertTreatmentTimeline(
        insertTreatmentTimelineInput,
      );

    const jobPayload = {
      stageType,
      treatmentId,
      userId,
      doctorId,
      stageMessageId: treatmentTimeline[0].stage_message_id,
      scheduleId: treatmentTimeline[0].schedule_id,
    };

    this.eventEmitter.emit(
      TreatmentTimelineEvent.DEFAULT_TIMELINE_MESSAGE_ADDED,
      new DefaultTimelineMessageAddedEvent(jobPayload),
    );
    return `${stageType}: ${frequencyStageMessages[0].frequency} Treatment Timeline Messages Added Successfully`;
  }

  async getTreatmentTimeline(
    inputs: GetTreatmentTimelineInput,
    userId: string,
    lang: string,
    loggedInUserRole: UserRoles,
  ): Promise<GetTreatmentTimelineResponse> {
    const { treatment_id: treatmentId } = inputs;

    const { treatmentTimeline, total } =
      await this.treatmentTimelineRepo.getTreatmentTimeline({
        treatmentId,
        userId,
        lang,
        loggedInUserRole,
        page: inputs.page,
        limit: inputs.limit,
        filters: inputs.filters,
      });

    const treatmentTimelineMessages = treatmentTimeline.map(
      (timelineMessage): TreatementTimelineMessage => {
        if (!timelineMessage.schedule_with_answers) {
          return timelineMessage;
        }
        const [agenda] = this.schedulesService.mapUserSchedules([
          timelineMessage.schedule_with_answers,
        ]);
        return {
          ...timelineMessage,
          /** from database we are getting the start and end date as date string
           * so we need to convert it to Date because in schema the type is GraphQLDateTime
           */
          agenda: {
            ...agenda,
            start_date: new Date(agenda.start_date),
            end_date: agenda.end_date ? new Date(agenda.end_date) : undefined,
          },
        };
      },
    );

    const hasMore = inputs.page * inputs.limit < total;
    return { treatmentTimelineMessages, hasMore };
  }

  async updatedDefaultStageMessagesJobs(updatedStage: Stage): Promise<string> {
    const { id, organisation_id, treatment_option_id, is_active, age_group } =
      updatedStage;

    if (!is_active) {
      await this.treatmentTimelineMessageQueue.removeDelayedJobsByStageId(id);
      return ` Stage inactivited, Removed Default timeline Jobs for stage ${id}`;
    }

    if (!treatment_option_id || !age_group?.length) {
      return `Required data not availabe`;
    }

    const treatments =
      await this.treatmentTimelineRepo.getActiveTreatmentWithDoctorRole(
        organisation_id,
        treatment_option_id,
        age_group,
      );

    if (!treatments.length) {
      return 'Treatments not availabe';
    }
    //remove existing jobs
    await this.treatmentTimelineMessageQueue.removeDelayedJobsByStageId(id);

    //adding new jobs
    treatments.forEach(async (treatment) => {
      const stageType =
        treatment.doctor_role === TreatmentRoles.experience_expert
          ? StageType.EXPERIENCE_EXPERT
          : StageType.DEFAULT;

      const jobPayload: DefaultTimelineMessageData = {
        stageType,
        treatmentId: treatment.id,
        userId: treatment.user_id,
        doctorId: treatment.doctor_id,
      };

      await this.treatmentTimelineMessageQueue.addCheckDefaultTimelineMessageJob(
        jobPayload,
      );
    });
    return `Updated Default Timeline Messages jobs Successfully`;
  }

  async editTreatmentTimelineNote(
    input: UpdateTreatmentTimelineNoteInput,
  ): Promise<UpdateTreatmentTimelineNoteResponse> {
    const {
      treatment_timeline_id: treatmentTimelineId,
      treatment_timeline_note,
    } = input;
    await this.validateNoteTypeInput(treatment_timeline_note);
    const treatmentTimeline =
      await this.treatmentTimelineRepo.getTreatmentTimelineMessage(
        treatmentTimelineId,
      );
    if (!treatmentTimeline) {
      throw new NotFoundException(
        `treatment-timeline.treatment_message_not_found`,
      );
    }
    const { attachment_id } = treatmentTimeline;
    if (!attachment_id) {
      throw new BadRequestException(
        `treatment-timeline.treatment_timeline_attachment_not_found`,
      );
    }
    const treatmentTimelineAttachment =
      await this.treatmentTimelineRepo.getTreatmentTimelineAttachmentWithType(
        attachment_id,
        TimelineAttachmentType.NOTE,
      );
    if (!treatmentTimelineAttachment) {
      throw new NotFoundException(
        `treatment-timeline.treatment_timeline_attachment_not_found`,
      );
    }
    await this.treatmentTimelineRepo.updateTreatmentTimelineAttachmentById(
      treatmentTimelineAttachment.id,
      treatment_timeline_note,
    );
    return {
      message: this.translationService.translate(
        `treatment-timeline.treatment_timeline_note_updated`,
      ),
    };
  }

  async deleteTreatmentTimelineMessage(
    args: DeleteTreatmentTimelineMessageArgs,
    loggedInUserId: string,
  ): Promise<DeleteTreatmentTimelineMessageResponse> {
    const { treatmentId, timelineMessageId, scheduleId } = args;

    const treatmentSchedulePromise = scheduleId
      ? this.treatmentTimelineRepo.getTreatmentSchedule(scheduleId, treatmentId)
      : undefined;

    const [treatment, treatmentTimelineMessage, schdule] = await Promise.all([
      this.treatmentTimelineRepo.getDoctorTreatment(
        loggedInUserId,
        treatmentId,
      ),
      this.treatmentTimelineRepo.getTreatmentTimelineMessage(timelineMessageId),
      treatmentSchedulePromise,
    ]);

    if (!treatmentTimelineMessage) {
      throw new NotFoundException(`treatments.treatment_message_not_found`);
    }
    if (treatmentTimelineMessage.stage_type === StageType.DEFAULT) {
      throw new BadRequestException(
        `treatment-timeline.default_treatment_message_cannot_be_deleted`,
      );
    }
    if (scheduleId && !schdule) {
      throw new NotFoundException(`treatments.treatment_schedule_not_found`);
    }
    if (!treatment) {
      throw new NotFoundException(`treatments.treatment_not_found`);
    }

    if (
      schdule &&
      schdule.schedule_for === ScheduleFor.APPOINTMENT &&
      schdule.user_appointment_id
    ) {
      const date = this.utilsService.getISODateString(new Date());
      await this.schedulesService.disableAppointmentSchedule(
        schdule.user_appointment_id,
        date,
        loggedInUserId,
      );
      return {
        message: this.translationService.translate(
          `treatment-timeline.treatment_timeline_message_deleted`,
        ),
      };
    }

    const promises: [
      Promise<TreatmentTimeline>?,
      Promise<Schedule | undefined>?,
    ] = [
      this.treatmentTimelineRepo.deleteTreatmentTimelineMessage(
        timelineMessageId,
      ),
    ];

    if (schdule) {
      const date = this.utilsService.getISODateString(new Date());
      const disableSchedulePromise = this.treatmentTimelineRepo.disableSchedule(
        schdule.id,
        date,
        loggedInUserId,
      );
      promises.push(disableSchedulePromise);
    }

    await Promise.all(promises);

    return {
      message: this.translationService.translate(
        `treatment-timeline.treatment_timeline_message_deleted`,
      ),
    };
  }

  async editTreatmentTimelineFile(
    input: UpdateTreatmentTimelineFileInput,
  ): Promise<UpdateTreatmentTimelineFileResponse> {
    const {
      treatment_timeline_id: treatmentTimelineId,
      treatment_timeline_file,
    } = input;
    await this.validateFileTypeInput(treatment_timeline_file);
    const treatmentTimelineAttachment =
      await this.treatmentTimelineRepo.getTreatmentTimelineWithAttachment(
        treatmentTimelineId,
        TimelineAttachmentType.FILE,
      );
    if (!treatmentTimelineAttachment) {
      throw new NotFoundException(
        `treatment-timeline.treatment_timeline_attachment_not_found`,
      );
    }
    await this.treatmentTimelineRepo.updateTreatmentTimelineAttachmentById(
      treatmentTimelineAttachment.id,
      treatment_timeline_file,
    );
    return {
      message: this.translationService.translate(
        `treatment-timeline.treatment_timeline_file_updated`,
      ),
    };
  }
}
