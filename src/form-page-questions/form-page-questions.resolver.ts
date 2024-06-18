import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { Roles } from '@shared/decorators/roles.decorator';
import { JwtAuthGuard } from '@shared/guards/auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import {
  GenerateUUIDResponse,
  GetFormResultArgs,
  GetFormResultResponse,
} from './dto/form-page-questions-points.dto';
import { FormPageQuestionsService } from './form-page-questions.service';

@Resolver()
export class FormPageQuestionsResolver {
  constructor(
    private readonly formPageQuestionsService: FormPageQuestionsService,
  ) {}

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetFormResultResponse, {
    name: 'GetFormResult',
  })
  async getFormResult(
    @Args() args: GetFormResultArgs,
  ): Promise<GetFormResultResponse> {
    return this.formPageQuestionsService.getFormResult(args.userFormAnswersId);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GenerateUUIDResponse, {
    name: 'GenerateUUID',
  })
  async generateUUID(): Promise<GenerateUUIDResponse> {
    return this.formPageQuestionsService.generateUUID();
  }
}
