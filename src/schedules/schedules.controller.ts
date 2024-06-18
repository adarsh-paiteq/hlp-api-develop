import {
  Body,
  Controller,
  Post,
  Put,
  Param,
  UseGuards,
  Query,
  Get,
} from '@nestjs/common';
import { LoggedInUser } from '../shared/auth/jwt.strategy';
import { Roles } from '../shared/decorators/roles.decorator';
import { GetUser } from '../shared/decorators/user.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import {
  AddReminderBodyDto,
  GetToolkitResultParam,
  GetToolkitResultQuery,
} from './schedules.dto';
import { SchedulesService } from './schedules.service';
import {
  GetUserHabitArgs,
  GetUserHabitsResponse,
} from './dto/get-user-habits.dto';
import { GetToolkitResultResponse } from './dto/get-toolkit-result.dto';
import {
  HandleScheduleUpdateBody,
  HandleScheduleUpdateResponse,
} from './dto/handle-schedule-update.dto';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  /**
   * @deprecated getToolkitResult Action has been migrated in the getScheduleResult resolver.
   */
  @Get('/:id/result')
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getToolkitResult(
    @Param() param: GetToolkitResultParam,
    @Query() query: GetToolkitResultQuery,
    @GetUser() user: LoggedInUser,
  ): Promise<GetToolkitResultResponse> {
    return this.schedulesService.getToolkitResult(
      param.id,
      query.date,
      user.id,
    );
  }

  /**
   * @description used to add the reminder jobs
   */
  @Post('/reminders')
  async addReminder(@Body() body: AddReminderBodyDto): Promise<void> {
    return this.schedulesService.addReminder(body);
  }

  /**
   * @deprecated The specified Action and Event could not be found. Additionally, it appears that they have not been migrated and are related to the testing controller.
   */
  @Put('/:id/checkSchedule')
  async checkSchedule(@Param('id') id: string): Promise<string> {
    await this.schedulesService.checkSchedule(id);
    return 'OK';
  }

  /**
   * @deprecated The specified Action and Event could not be found. Additionally, it appears that they have not been migrated and are related to the testing controller.
   */
  @Get('/habits')
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserHabits(
    @GetUser() user: LoggedInUser,
    @Query() query: GetUserHabitArgs,
  ): Promise<GetUserHabitsResponse> {
    return this.schedulesService.getUserHabits(user.id, query);
  }

  /**
   * @deprecated The specified Action and Event could not be found. Additionally, it appears that they have not been migrated and are related to the testing controller.
   */
  @Post('/')
  async handleScheduleUpdate(
    @Body() body: HandleScheduleUpdateBody,
  ): Promise<HandleScheduleUpdateResponse> {
    return this.schedulesService.handleScheduleUpdate(body);
  }
}
