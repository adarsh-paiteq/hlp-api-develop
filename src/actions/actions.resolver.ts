import { UseGuards } from '@nestjs/common';
import { Args, Resolver, Query } from '@nestjs/graphql';
import { LoggedInUser } from '../shared/auth/jwt.strategy';
import { Roles } from '../shared/decorators/roles.decorator';
import { GetUser } from '../shared/decorators/user.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import { ActionsService } from './actions.service';
import { ActionsArgs, GetActionInfoResponse } from './dto/actions.dto';
import { ClaimActionResponse } from './dto/user-claim-action.dto';
import { GetActionsResponse } from './dto/get-user-action.dto';
import { I18nNextLanguage } from '@shared/decorators/language.decorator';

@Resolver()
export class ActionsResolver {
  constructor(private readonly actionsService: ActionsService) {}
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetActionInfoResponse, { name: 'getActionInfo' })
  async getActionInfo(
    @GetUser() user: LoggedInUser,
    @Args() args: ActionsArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<GetActionInfoResponse> {
    return this.actionsService.getActionInfo(user.id, args.actionId, lang);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => ClaimActionResponse, { name: 'userClaimAction' })
  async userClaimAction(
    @GetUser() user: LoggedInUser,
    @Args() args: ActionsArgs,
  ): Promise<ClaimActionResponse> {
    return this.actionsService.userClaimAction(user.id, args.actionId);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetActionsResponse, { name: 'getActions' })
  async getAction(@GetUser() user: LoggedInUser): Promise<GetActionsResponse> {
    return this.actionsService.getAction(user.id);
  }
}
