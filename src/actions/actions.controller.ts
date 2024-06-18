import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { LoggedInUser } from '../shared/auth/jwt.strategy';
import { Roles } from '../shared/decorators/roles.decorator';
import { GetUser } from '../shared/decorators/user.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import {
  ClaimActionsParamsDto,
  ClaimActionsResponseDto,
  GetActionsParams,
  GetActionsResponseDto,
} from './actions.dto';
import { ActionsService } from './actions.service';

@Controller('actions')
export class ActionsController {
  constructor(private readonly actionsService: ActionsService) {}

  /**
   * @deprecated claimAction Action are used Performs the claim action.This action is currently used directly within the app and has not been migrated.
   */
  @Get('/:id/claim')
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async claimAction(
    @GetUser() user: LoggedInUser,
    @Param() param: ClaimActionsParamsDto,
  ): Promise<ClaimActionsResponseDto> {
    return this.actionsService.claimAction(user.id, param.id);
  }

  /**
   * @deprecated getUserActions Action are used for detrieves the user actions.This action is currently utilized within the app and has  been migrated getActions.
   */
  @Get('/users/:id')
  async getActions(
    @Param() params: GetActionsParams,
  ): Promise<GetActionsResponseDto> {
    return this.actionsService.getActions(params);
  }
}
