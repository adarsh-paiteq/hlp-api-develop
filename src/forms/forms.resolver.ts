import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FormsService } from './forms.service';
import { Roles } from '@shared/decorators/roles.decorator';
import { JwtAuthGuard } from '@shared/guards/auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import { UseGuards } from '@nestjs/common';
import { GetFormInfoArgs, GetFormInfoResponse } from './dto/get-form-info.dto';
import {
  GetFormPageQuestionsArgs,
  GetFormQuestionsResponse,
} from './dto/get-form-page-questions.dto';
import {
  SaveFormPageQuestionAnswersInput,
  SaveFormPageQuestionAnswersResponse,
} from './dto/save-form-page-question-answers.dto';
import { GetUser } from '@shared/decorators/user.decorator';
import { LoggedInUser } from '@shared/auth/jwt.strategy';
import {
  SaveUserFormAnswerInput,
  SaveUserFormAnswerResponse,
} from './dto/save-user-form-answers.dto';
import {
  GetFormHistoryArgs,
  GetFormHistoryResponse,
} from './dto/get-form-history.dto';
import { FormResultArgs, FormResultResponse } from './dto/get-form-result.dto';
import { I18nNextLanguage } from '@shared/decorators/language.decorator';
import { GetUserFormHistoryArgs } from './dto/get-user-form-history.dto';
import {
  GetAppointmentFormsInsightArgs,
  GetAppointmentFormsInsightResponse,
} from './dto/get-appointment-form-insight.dto';

@Resolver()
export class FormsResolver {
  constructor(private readonly formsService: FormsService) {}

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetFormInfoResponse, {
    name: 'getFormInfo',
  })
  async getFormInfo(
    @Args() args: GetFormInfoArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<GetFormInfoResponse> {
    return this.formsService.getFormInfo(lang, args.toolkitId, args.formId);
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetFormQuestionsResponse, {
    name: 'getFormPageQuestions',
  })
  async getFormPageQuestions(
    @Args() args: GetFormPageQuestionsArgs,
  ): Promise<GetFormQuestionsResponse> {
    return this.formsService.getFormPageQuestions(args.formId, args.pageId);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => SaveFormPageQuestionAnswersResponse, {
    name: 'saveFormPageQuestionAnswers',
  })
  async saveFormPageQuestionAnswers(
    @Args('input')
    args: SaveFormPageQuestionAnswersInput,
    @GetUser() user: LoggedInUser,
  ): Promise<SaveFormPageQuestionAnswersResponse> {
    return this.formsService.saveFormPageQuestionAnswers(args, user.id);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => SaveUserFormAnswerResponse, {
    name: 'saveUserFormAnswers',
  })
  async saveUserFormAnswers(
    @Args('input')
    args: SaveUserFormAnswerInput,
    @GetUser() user: LoggedInUser,
  ): Promise<SaveUserFormAnswerResponse> {
    return this.formsService.saveUserFormAnswers(args, user.id);
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => FormResultResponse, {
    name: 'getFormResult',
  })
  async getFormResult(
    @Args() args: FormResultArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<FormResultResponse> {
    return this.formsService.getFormResult(args.userFormAnswersId, lang);
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetFormHistoryResponse, {
    name: 'getFormHistory',
  })
  async getFormHistory(
    @Args() args: GetFormHistoryArgs,
    @GetUser() user: LoggedInUser,
  ): Promise<GetFormHistoryResponse> {
    return this.formsService.getFormHistory(args, user.id);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetFormHistoryResponse, {
    name: 'getUserFormHistory',
  })
  async getUserFormHistory(
    @Args() args: GetUserFormHistoryArgs,
  ): Promise<GetFormHistoryResponse> {
    return await this.formsService.getFormHistory(args, args.userId);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetAppointmentFormsInsightResponse, {
    name: 'getAppointmentFormsInsight',
  })
  async getAppointmentFormsInsight(
    @Args() args: GetAppointmentFormsInsightArgs,
  ): Promise<GetAppointmentFormsInsightResponse> {
    return await this.formsService.getAppointmentFormsInsight(args);
  }
}
