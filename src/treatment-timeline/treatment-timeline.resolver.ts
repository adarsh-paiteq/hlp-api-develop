import { Args, Query, Resolver, Mutation } from '@nestjs/graphql';
import { TreatmentTimelineService } from './treatment-timeline.service';
import { Roles } from '@shared/decorators/roles.decorator';
import { JwtAuthGuard } from '@shared/guards/auth.guard';
import { UserRoles } from '@users/users.dto';
import { GetStageArgs, GetStageResponse } from './dto/get-stage.dto';
import { AddStageInput, AddStageResponse } from './dto/add-stage.dto';
import { LoggedInUser } from '@shared/auth/jwt.strategy';
import { GetUser } from '@shared/decorators/user.decorator';
import { RolesGuard } from '@shared/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { I18nNextLanguage } from '@shared/decorators/language.decorator';
import { UpdateStageInput, UpdateStageResponse } from './dto/update-stage.dto';
import {
  AddTreatmentFileInput,
  AddTreatmentFileResponse,
} from './dto/add-treatment-file.dto';
import {
  AddTreatmentNoteInput,
  AddTreatmentNoteResponse,
} from './dto/add-treatment-note.dto';
import {
  AddUserTreatmentFileInput,
  AddUserTreatmentFileResponse,
} from './dto/add-user-treatment-file.dto';
import { AddUserTreatmentNoteInput } from './dto/add-user-treatment-note.dto';
import {
  GetTreatmentTimelineInput,
  GetTreatmentTimelineResponse,
} from './dto/get-treatment-timeline.dto';
import {
  GetUserTreatmentTimelineInput,
  GetUserTreatmentTimelineResponse,
} from './dto/get-user-treatment-timeline.dto';
import {
  UpdateTreatmentTimelineNoteInput,
  UpdateTreatmentTimelineNoteResponse,
} from './dto/edit-treatment-timeline-note.dto';
import {
  DeleteTreatmentTimelineMessageArgs,
  DeleteTreatmentTimelineMessageResponse,
} from './dto/delete-treatment-timeline-message.dto';
import {
  UpdateTreatmentTimelineFileInput,
  UpdateTreatmentTimelineFileResponse,
} from './dto/edit-treatment-timeline-file.dto';

@Resolver()
export class TreatmentTimelineResolver {
  constructor(
    private readonly treatmentTimelineService: TreatmentTimelineService,
  ) {}

  @Query(() => GetStageResponse, { name: 'getStage' })
  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getStage(
    @Args() args: GetStageArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<GetStageResponse> {
    return await this.treatmentTimelineService.getStage(args.stageId, lang);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => AddStageResponse, {
    name: 'addStage',
  })
  async addStage(
    @GetUser() admin: LoggedInUser,
    @Args('input')
    input: AddStageInput,
  ): Promise<AddStageResponse> {
    return this.treatmentTimelineService.addStage(admin.id, input);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UpdateStageResponse, {
    name: 'updateStage',
  })
  async updateStage(
    @GetUser() admin: LoggedInUser,
    @Args('input')
    input: UpdateStageInput,
  ): Promise<UpdateStageResponse> {
    return this.treatmentTimelineService.updateStage(admin.id, input);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => AddTreatmentFileResponse, {
    name: 'addTreatmentFile',
  })
  async addTreatmentFile(
    @GetUser() user: LoggedInUser,
    @Args('input')
    input: AddTreatmentFileInput,
  ): Promise<AddTreatmentFileResponse> {
    return this.treatmentTimelineService.addTreatmentFile(
      user.id,
      input,
      user.id,
    );
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => AddTreatmentNoteResponse, {
    name: 'addTreatmentNote',
  })
  async addTreatmentNote(
    @GetUser() user: LoggedInUser,
    @Args('input')
    input: AddTreatmentNoteInput,
  ): Promise<AddTreatmentNoteResponse> {
    return await this.treatmentTimelineService.addTreatmentNote(
      user.id,
      input,
      user.id,
    );
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => AddUserTreatmentFileResponse, {
    name: 'addUserTreatmentFile',
  })
  async addUserTreatmentFile(
    @GetUser() user: LoggedInUser,
    @Args('input')
    input: AddUserTreatmentFileInput,
  ): Promise<AddUserTreatmentFileResponse> {
    const { user_id, ...addUserTreatmentFileInput } = input;
    return await this.treatmentTimelineService.addTreatmentFile(
      user.id,
      addUserTreatmentFileInput,
      user_id,
    );
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => AddTreatmentNoteResponse, {
    name: 'addUserTreatmentNote',
  })
  async addUserTreatmentNote(
    @GetUser() user: LoggedInUser,
    @Args('input')
    input: AddUserTreatmentNoteInput,
  ): Promise<AddTreatmentNoteResponse> {
    const { user_id, ...addUserTreatmentNoteInput } = input;
    return await this.treatmentTimelineService.addTreatmentNote(
      user.id,
      addUserTreatmentNoteInput,
      user_id,
    );
  }

  @Query(() => GetTreatmentTimelineResponse, { name: 'getTreatmentTimeline' })
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getTreatmentTimeline(
    @GetUser() user: LoggedInUser,
    @Args('input') inputs: GetTreatmentTimelineInput,
    @I18nNextLanguage() lang: string,
  ): Promise<GetTreatmentTimelineResponse> {
    return await this.treatmentTimelineService.getTreatmentTimeline(
      inputs,
      user.id,
      lang,
      user.role,
    );
  }

  @Query(() => GetUserTreatmentTimelineResponse, {
    name: 'getUserTreatmentTimeline',
  })
  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserTreatmentTimeline(
    @GetUser() user: LoggedInUser,
    @Args('input') inputs: GetUserTreatmentTimelineInput,
    @I18nNextLanguage() lang: string,
  ): Promise<GetUserTreatmentTimelineResponse> {
    return await this.treatmentTimelineService.getTreatmentTimeline(
      inputs,
      inputs.user_id,
      lang,
      user.role,
    );
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UpdateTreatmentTimelineNoteResponse, {
    name: 'editTreatmentTimelineNote',
  })
  async editTreatmentTimelineNote(
    @Args('input')
    input: UpdateTreatmentTimelineNoteInput,
  ): Promise<UpdateTreatmentTimelineNoteResponse> {
    return await this.treatmentTimelineService.editTreatmentTimelineNote(input);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => DeleteTreatmentTimelineMessageResponse, {
    name: 'deleteTreatmentTimelineMessage',
  })
  async deleteTreatmentTimelineMessage(
    @GetUser() user: LoggedInUser,
    @Args() args: DeleteTreatmentTimelineMessageArgs,
  ): Promise<DeleteTreatmentTimelineMessageResponse> {
    return this.treatmentTimelineService.deleteTreatmentTimelineMessage(
      args,
      user.id,
    );
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UpdateTreatmentTimelineFileResponse, {
    name: 'editTreatmentTimelineFile',
  })
  async editTreatmentTimelineFile(
    @Args('input')
    input: UpdateTreatmentTimelineFileInput,
  ): Promise<UpdateTreatmentTimelineFileResponse> {
    return await this.treatmentTimelineService.editTreatmentTimelineFile(input);
  }
}
