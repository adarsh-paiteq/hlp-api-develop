import {
  Controller,
  Get,
  Query,
  UseGuards,
  Param,
  Body,
  Post,
} from '@nestjs/common';
import { LoggedInUser } from '../shared/auth/jwt.strategy';
import { Roles } from '../shared/decorators/roles.decorator';
import { GetUser } from '../shared/decorators/user.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import {
  GetCheckinsQueryDto,
  GetUserCheckinsResponseDto,
  GetUserNextCheckinLevelParamsTest,
  GetUserNextCheckinLevelResponse,
  DisableCheckinSchedulesBodyDto,
} from './checkins.dto';
import { CheckinsQueue } from './checkins.queue';
import { CheckinsService } from './checkins.service';

@Controller('checkins')
export class CheckinsController {
  constructor(
    private readonly checkinsService: CheckinsService,
    private readonly checkinsQueue: CheckinsQueue,
  ) {}

  @Get('/')
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getCheckins(
    @GetUser() user: LoggedInUser,
    @Query() query: GetCheckinsQueryDto,
  ): Promise<GetUserCheckinsResponseDto> {
    return this.checkinsService.getUserCheckins(user.id, query.date);
  }

  @Get('/test')
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserCheckins(
    @GetUser() user: LoggedInUser,
    @Query() query: GetCheckinsQueryDto,
  ): Promise<GetUserCheckinsResponseDto> {
    return this.checkinsService.getUserCheckins(user.id, query.date);
  }

  @Get('/nextLevel/users/:id')
  async getNextCheckinLevelTest(
    @Param() param: GetUserNextCheckinLevelParamsTest,
  ): Promise<GetUserNextCheckinLevelResponse> {
    return this.checkinsService.getUserNextCheckinLevel(param.id);
  }

  @Post('/disableSchedules')
  async disableCheckinSchedules(
    @Body() body: DisableCheckinSchedulesBodyDto,
  ): Promise<string> {
    return this.checkinsService.disableCheckinSchedules(body);
  }
}
