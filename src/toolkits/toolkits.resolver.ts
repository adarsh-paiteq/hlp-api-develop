import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LoggedInUser } from '../shared/auth/jwt.strategy';
import { Roles } from '../shared/decorators/roles.decorator';
import { GetUser } from '../shared/decorators/user.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import {
  GetToolkitArgs,
  GetToolkitDetailsResponse,
} from './dto/get-toolkit-details.dto';
import { GetToolKitArgs } from './dto/toolkits.dto';
import { ToolkitService } from './toolkit.service';
import {
  FilterToolkitCategoriesByGoalsInput,
  GetAnswersHistoryArgs,
  GetAnswersHistoryCalenderArgs,
  GetAnswersHistoryCalenderResponse,
  GetAnswersHistoryResponse,
  GetToolkitAnswerArgs,
  ToolkitHistoryPopupResponse,
  GetToolkitGraphArgs,
  GetToolkitGraphResponse,
  SearchToolkitsArgs,
  SearchToolkitsResponse,
  ToolkitCategory,
  Toolkit,
} from './toolkits.model';
import { GetToolkitAnswerResponse } from './dto/get-toolkit-answer.dto';
import {
  GetEpisodeToolkitDetailsArgs,
  GetEpisodeToolkitDetailsResponse,
} from './dto/get-episode-toolkit-details.dto';
import {
  SavePlayedAudioToolkitAudioFileInput,
  SavePlayedAudioToolkitAudioFileResponse,
} from './dto/save-played-audio-toolkit-audio-file.dto';
import {
  GetAudioToolkitDetailsArgs,
  GetAudioToolkitDetailsResponse,
} from './dto/get-audio-toolkit-details.dto';
import {
  SearchUserToolkitsArgs,
  SearchUserToolkitsResponse,
} from './dto/search-user-toolkits.dto';
import {
  GetUserToolkitArgs,
  GetUserToolkitDetailsResponse,
} from './dto/get-user-toolkit-details.dto';
import {
  SaveUserToolkitAnswerInput,
  SaveUserToolkitAnswerResponse,
} from './dto/save-user-toolkit-answer.dto';
import {
  GetUserToolkitHistoryArgs,
  GetUserToolkitHistoryResponse,
} from './dto/get-user-toolkit-history.dto';
import {
  GetUserToolkitAnswerArgs,
  GetUserToolkitAnswerResponse,
} from './dto/get-user-toolkit-answer.dto';
import {
  GetUserToolkitGraphArgs,
  GetUserToolkitGraphResponse,
} from './dto/get-user-toolkit-graph.dto';
import {
  GetAppointmentDetailsArgs,
  GetAppointmentDetailsResponse,
} from './dto/get-appointment-details.dto';
import { I18nNextLanguage } from '@shared/decorators/language.decorator';
import {
  SaveUserAppointmentAnswerInput,
  SaveUserAppointmentAnswerResponse,
} from './dto/save-user-appointment-answer.dto';
import {
  GetAppointmentHistoryArgs,
  GetAppointmentHistoryResponse,
} from './dto/get-appointment-history.dto';
import {
  GetUserAppointmentHistoryArgs,
  GetUserAppointmentHistoryResponse,
} from './dto/get-user-appointment-history.dto';
import {
  GetUserAppointmentDetailsArgs,
  GetUserAppointmentDetailsResponse,
} from './dto/get-user-appointment-details.dto';
import {
  GetFormToolkitDetailsArgs,
  GetFormToolkitDetailResponse,
} from './dto/get-toolkit-form-details.dto';
import {
  SaveToolkitAnswerResponse,
  SaveToolkitAnswersInput,
} from './dto/save-toolkit-answer.dto';
import {
  GetAllToolkitsHistoryArgs,
  GetAllToolkitsHistoryResponse,
} from './dto/get-toolkit-history.dto';
import {
  GetUserAllToolkitsHistoryArgs,
  GetUserAllToolkitsHistoryResponse,
} from './dto/get-user-all-toolkit-history.dto';

@Resolver()
export class ToolkitsResolver {
  constructor(private readonly toolkitsService: ToolkitService) {}

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetToolkitDetailsResponse, { name: 'getToolkitDetails' })
  async getToolkitDetails(
    @GetUser() user: LoggedInUser,
    @Args() args: GetToolkitArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<GetToolkitDetailsResponse> {
    return this.toolkitsService.getToolkitDetails(args, user.id, lang);
  }

  /**
   * @description used in doctors cms
   */
  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetUserToolkitDetailsResponse, { name: 'getUserToolkitDetails' })
  async getUserToolkitDetails(
    @Args() args: GetUserToolkitArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<GetUserToolkitDetailsResponse> {
    return this.toolkitsService.getToolkitDetails(args, args.user_id, lang);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetToolkitGraphResponse, { name: 'getToolkitGraphData' })
  async getToolkitGraph(
    @GetUser() user: LoggedInUser,
    @Args() args: GetToolkitGraphArgs,
  ): Promise<GetToolkitGraphResponse> {
    return this.toolkitsService.getToolkitGraph(user.id, args);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetAnswersHistoryResponse, { name: 'GetToolkitAnswersHistory' })
  async getAnswersHistory(
    @Args() args: GetAnswersHistoryArgs,
    @GetUser() user: LoggedInUser,
    @I18nNextLanguage() lang: string,
  ): Promise<GetAnswersHistoryResponse> {
    return this.toolkitsService.getAnswersHistory(args, user.id, lang);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetAnswersHistoryCalenderResponse, {
    name: 'GetToolkitAnswersHistoryCalender',
  })
  async getAnswersHistoryCalender(
    @Args() args: GetAnswersHistoryCalenderArgs,
    @GetUser() user: LoggedInUser,
  ): Promise<GetAnswersHistoryCalenderResponse> {
    return this.toolkitsService.getToolkitAnswersHistoryCalender(args, user.id);
  }
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => [ToolkitCategory], {
    name: 'FilterToolkitCategoriesByGoals',
  })
  async filterToolkitCategoriesByGoals(
    @GetUser() user: LoggedInUser,
    @Args('input') input: FilterToolkitCategoriesByGoalsInput,
  ): Promise<ToolkitCategory[]> {
    const { goal_ids } = input;
    return await this.toolkitsService.filterToolkitCategoriesByGoals(
      user.id,
      goal_ids,
    );
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => SearchToolkitsResponse)
  async searchToolkits(
    @Args() args: SearchToolkitsArgs,
    @GetUser() user: LoggedInUser,
    @I18nNextLanguage() lang: string,
  ): Promise<SearchToolkitsResponse> {
    return this.toolkitsService.searchToolkits(user.id, args, user.role, lang);
  }

  /**
   * This function is deprecated and should not be used.
   * This code is only included for backward compatibility.
   * Use the @function getToolkitAnswer() function instead.
   * @deprecated
   */
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => ToolkitHistoryPopupResponse, {
    nullable: false,
    name: 'ToolkitHistoryPopup',
  })
  async getToolkitHistoryPopup(
    @Args() args: GetToolkitAnswerArgs,
    @GetUser() user: LoggedInUser,
  ): Promise<ToolkitHistoryPopupResponse> {
    return this.toolkitsService.getToolkitHistoryPopup(user.id, args);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => Toolkit, { name: 'getToolKitById' })
  async getToolkitById(@Args() args: GetToolKitArgs): Promise<Toolkit> {
    return this.toolkitsService.getToolkitById(args.toolkitId);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetToolkitAnswerResponse, {
    name: 'getToolkitAnswer',
    description: 'get data for Toolkit History pop up screen',
  })
  async getToolkitAnswer(
    @Args() args: GetToolkitAnswerArgs,
    @GetUser() user: LoggedInUser,
  ): Promise<GetToolkitAnswerResponse> {
    return this.toolkitsService.getToolkitAnswer(user.id, args);
  }

  /**
   * @description used in doctors cms
   */
  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetUserToolkitAnswerResponse, {
    name: 'getUserToolkitAnswer',
    description:
      'Used in Doctor CMS to get data for Toolkit History pop up screen',
  })
  async getUserToolkitAnswer(
    @Args() args: GetUserToolkitAnswerArgs,
  ): Promise<GetUserToolkitAnswerResponse> {
    return this.toolkitsService.getToolkitAnswer(args.userId, args);
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetEpisodeToolkitDetailsResponse, {
    name: 'getEpisodeToolkitDetails',
  })
  async getEpisodeToolkitDetails(
    @Args() args: GetEpisodeToolkitDetailsArgs,
  ): Promise<GetEpisodeToolkitDetailsResponse> {
    return this.toolkitsService.getEpisodeToolkitDetails(args);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => SavePlayedAudioToolkitAudioFileResponse, {
    name: 'savePlayedAudioToolkitAudioFile',
  })
  async savePlayedAudioToolkitAudioFile(
    @Args('input')
    input: SavePlayedAudioToolkitAudioFileInput,
  ): Promise<SavePlayedAudioToolkitAudioFileResponse> {
    return this.toolkitsService.savePlayedAudioToolkitAudioFile(input);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetAudioToolkitDetailsResponse, {
    name: 'getAudioToolkitDetails',
  })
  async getAudioToolkitDetails(
    @Args() args: GetAudioToolkitDetailsArgs,
  ): Promise<GetAudioToolkitDetailsResponse> {
    return this.toolkitsService.getAudioToolkitDetails(args);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => SearchToolkitsResponse, { name: 'searchUserToolkits' })
  async searchUserToolkits(
    @GetUser() user: LoggedInUser,
    @Args() args: SearchUserToolkitsArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<SearchUserToolkitsResponse> {
    const { userId, name, goalIds } = args;
    return this.toolkitsService.searchToolkits(
      userId,
      { name, goalIds },
      user.role,
      lang,
    );
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => SaveUserToolkitAnswerResponse, {
    name: 'saveUserToolkitAnswer',
  })
  async saveUserToolkitAnswer(
    @GetUser() user: LoggedInUser,
    @Args('input') input: SaveUserToolkitAnswerInput,
  ): Promise<SaveUserToolkitAnswerResponse> {
    return this.toolkitsService.saveUserToolkitAnswer(user.id, input);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetUserToolkitHistoryResponse, { name: 'getUserToolkitHistory' })
  async getUserToolkitHistory(
    @Args() args: GetUserToolkitHistoryArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<GetUserToolkitHistoryResponse> {
    return await this.toolkitsService.getAnswersHistory(
      args,
      args.userId,
      lang,
    );
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetUserToolkitGraphResponse, { name: 'getUserToolkitGraphData' })
  async getUserToolkitGraphData(
    @Args() args: GetUserToolkitGraphArgs,
  ): Promise<GetUserToolkitGraphResponse> {
    return await this.toolkitsService.getToolkitGraph(args.userId, args);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => SaveUserAppointmentAnswerResponse, {
    name: 'saveUserAppointmentAnswer',
  })
  async saveUserAppointmentAnswer(
    @GetUser() user: LoggedInUser,
    @Args('input') input: SaveUserAppointmentAnswerInput,
  ): Promise<SaveUserAppointmentAnswerResponse> {
    return this.toolkitsService.saveUserAppointmentAnswer(user.id, input);
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetAppointmentDetailsResponse, {
    name: 'getAppointmentDetails',
  })
  async getAppointmentDetails(
    @GetUser() user: LoggedInUser,
    @Args() args: GetAppointmentDetailsArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<GetAppointmentDetailsResponse> {
    return this.toolkitsService.getAppointmentDetails(user.id, args, lang);
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetAppointmentHistoryResponse, { name: 'getAppointmentHistory' })
  async getAppointmentHistory(
    @GetUser() user: LoggedInUser,
    @Args() args: GetAppointmentHistoryArgs,
  ): Promise<GetAppointmentHistoryResponse> {
    return await this.toolkitsService.getAppointmentHistory(user.id, args);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetUserAppointmentHistoryResponse, {
    name: 'getUserAppointmentHistory',
  })
  async getUserAppointmentHistory(
    @Args() args: GetUserAppointmentHistoryArgs,
  ): Promise<GetUserAppointmentHistoryResponse> {
    return await this.toolkitsService.getAppointmentHistory(args.userId, args);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetUserAppointmentDetailsResponse, {
    name: 'getUserAppointmentDetails',
  })
  async getUserAppointmentDetails(
    @Args() args: GetUserAppointmentDetailsArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<GetUserAppointmentDetailsResponse> {
    return this.toolkitsService.getAppointmentDetails(args.userId, args, lang);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetFormToolkitDetailResponse, {
    name: 'getFormToolkitDetails',
  })
  async getFormToolkitDetails(
    @Args() args: GetFormToolkitDetailsArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<GetFormToolkitDetailResponse> {
    return this.toolkitsService.getFormToolkitDetails(args, lang);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => SaveToolkitAnswerResponse, {
    name: 'saveToolkitAnswer',
  })
  async saveToolkitAnswer(
    @GetUser() user: LoggedInUser,
    @Args('input') input: SaveToolkitAnswersInput,
  ): Promise<SaveToolkitAnswerResponse> {
    return await this.toolkitsService.saveToolkitAnswer(user.id, input);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetAllToolkitsHistoryResponse, {
    name: 'getAllToolkitsHistory',
  })
  async getAllToolkitsHistory(
    @GetUser() user: LoggedInUser,
    @Args() args: GetAllToolkitsHistoryArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<GetAllToolkitsHistoryResponse> {
    return await this.toolkitsService.getAllToolkitsHistory(
      user.id,
      args,
      lang,
    );
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetUserAllToolkitsHistoryResponse, {
    name: 'getUserAllToolkitsHistory',
  })
  async getUserAllToolkitsHistory(
    @Args() args: GetUserAllToolkitsHistoryArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<GetUserAllToolkitsHistoryResponse> {
    return await this.toolkitsService.getAllToolkitsHistory(
      args.user_id,
      args,
      lang,
    );
  }
}
