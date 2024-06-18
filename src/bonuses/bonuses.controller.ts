import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { LoggedInUser } from '../shared/auth/jwt.strategy';
import { Roles } from '../shared/decorators/roles.decorator';
import { GetUser } from '../shared/decorators/user.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import {
  ClaimBonusParamDto,
  ClaimBonusResponseDto,
  GetBonusesParamDto,
  GetBonusesResponse,
  GetCheckinBonusQuery,
  GetCheckinBonusResponse,
  GetToolkitBonusQuery,
  GetTrophyBonuseQuery,
  GetTrophyBonusResponse,
} from './bonuses.dto';
import { BonusesService } from './bonuses.service';

@Controller('bonuses')
export class BonusesController {
  constructor(private readonly bonusesService: BonusesService) {}

  @Get('/users/:id')
  async getBonuses(
    @Param() param: GetBonusesParamDto,
  ): Promise<GetBonusesResponse> {
    return this.bonusesService.getBonuses(param);
  }

  @Post('/:id/claim')
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async claimBonus(
    @Param() param: ClaimBonusParamDto,
    @GetUser() user: LoggedInUser,
  ): Promise<ClaimBonusResponseDto> {
    return this.bonusesService.claimBonus(param.id, user.id);
  }

  @Get('/checkin')
  async getCheckinBonus(
    @Query() query: GetCheckinBonusQuery,
  ): Promise<GetCheckinBonusResponse> {
    return this.bonusesService.getCheckinBonus(query);
  }
  @Get('/toolkit')
  async getToolkitBonus(
    @Query() query: GetToolkitBonusQuery,
  ): Promise<GetTrophyBonusResponse> {
    return this.bonusesService.getToolkitBonus(query);
  }
  @Get('/trophy')
  async getTrophyBonus(
    @Query() query: GetTrophyBonuseQuery,
  ): Promise<GetTrophyBonusResponse> {
    return this.bonusesService.getTrophyBonus(query);
  }
}
