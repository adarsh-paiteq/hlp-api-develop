import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LoggedInUser } from '../shared/auth/jwt.strategy';
import { Roles } from '../shared/decorators/roles.decorator';
import { GetUser } from '../shared/decorators/user.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import {
  Schedule,
  UpdateScheduleRemindersArgs,
  UpdateScheduleRemindersResponse,
} from './schedules.model';
import { SchedulesService } from './schedules.service';
import {
  GetDashBoardResponse,
  GetDashboardArgs,
} from './dto/get-dashboard.dto';
import {
  GetUserAgendaArgs,
  GetUserAgendaResponse,
} from './dto/get-user-agenda.dto';
import { DisableScheduleArgs } from './dto/disable-schedule.dto';
import {
  CreateScheduleInput,
  CreateScheduleResponse,
} from './dto/create-schedule.dto';
import {
  GetToolkitResultArgs,
  GetToolkitResultResponse,
} from './dto/get-toolkit-result.dto';
import { GetScheduleArgs, GetScheduleResponse } from './dto/get-schedule.dto';
import {
  CreateUserScheduleInput,
  CreateUserScheduleResponse,
} from './dto/create-user-schedule.dto';
import {
  GetPatientAgendaArgs,
  GetPatientAgendaResponse,
} from './dto/get-patient-agenda.dto';
import {
  GetUserCalenderAgendaArgs,
  GetUserCalenderAgendaResponse,
} from './dto/get-user-calender-agenda.dto';
import {
  GetDoctorCalenderAgendaArgs,
  GetDoctorCalenderAgendaResponse,
} from './dto/get-doctor-calender-agenda.dto';
import { I18nNextLanguage } from '@shared/decorators/language.decorator';
import { DisableUserScheduleArgs } from './dto/disable-user-schedule.dto';
import {
  UpdateScheduleInput,
  UpdateScheduleResponse,
} from './dto/update-schedule.dto';
import {
  UpdateUserScheduleInput,
  UpdateUserScheduleResponse,
} from './dto/update-user-schedule.dto';
@Resolver()
export class SchedulesResolver {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UpdateScheduleRemindersResponse)
  async updateScheduleReminders(
    @GetUser() user: LoggedInUser,
    @Args() args: UpdateScheduleRemindersArgs,
  ): Promise<UpdateScheduleRemindersResponse> {
    return this.schedulesService.updateScheduleReminders(user.id, args);
  }

  @Query(() => GetDashBoardResponse, { name: 'getUserDashboard' })
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getDashBoard(
    @Args() args: GetDashboardArgs,
    @GetUser() user: LoggedInUser,
  ): Promise<GetDashBoardResponse> {
    return this.schedulesService.getDashboard(user.id, args);
  }

  /**
   * @description Used in Doctors cms to get patient(user) agenda
   *  */
  @Query(() => GetPatientAgendaResponse, { name: 'getPatientAgenda' })
  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getPatientAgenda(
    @Args() args: GetPatientAgendaArgs,
  ): Promise<GetPatientAgendaResponse> {
    return this.schedulesService.getPatientAgenda(args);
  }

  @Query(() => GetUserAgendaResponse, { name: 'getUserAgenda' })
  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserAgenda(
    @GetUser() user: LoggedInUser,
    @Args() args: GetUserAgendaArgs,
  ): Promise<GetUserAgendaResponse> {
    return this.schedulesService.getUserAgenda(user.id, args);
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => Schedule, { name: 'disableSchedule' })
  async disableSchedule(
    @GetUser() user: LoggedInUser,
    @Args() args: DisableScheduleArgs,
  ): Promise<Schedule> {
    return this.schedulesService.disableSchedule(
      user.id,
      user.id,
      args,
      user.role,
    );
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => Schedule, { name: 'disableUserSchedule' })
  async disableUserSchedule(
    @GetUser() user: LoggedInUser,
    @Args() args: DisableUserScheduleArgs,
  ): Promise<Schedule> {
    return this.schedulesService.disableSchedule(
      args.userId,
      user.id,
      args,
      user.role,
    );
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetToolkitResultResponse, {
    name: 'getScheduleResult',
  })
  async getScheduleResult(
    @GetUser() user: LoggedInUser,
    @Args() args: GetToolkitResultArgs,
  ): Promise<GetToolkitResultResponse> {
    return this.schedulesService.getToolkitResult(
      args.scheduleId,
      args.date,
      user.id,
    );
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => CreateScheduleResponse, {
    name: 'createSchedule',
  })
  async createSchedule(
    @GetUser() user: LoggedInUser,
    @Args('input') input: CreateScheduleInput,
  ): Promise<CreateScheduleResponse> {
    return this.schedulesService.createSchedule(
      user.id,
      input,
      user.id,
      user.role,
    );
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetScheduleResponse, {
    name: 'getSchedule',
  })
  async getSchedule(
    @Args() args: GetScheduleArgs,
  ): Promise<GetScheduleResponse> {
    return this.schedulesService.getSchedule(args.scheduleId);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => CreateUserScheduleResponse, {
    name: 'createUserSchedule',
  })
  async createUserSchedule(
    @GetUser() user: LoggedInUser,
    @Args('input') input: CreateUserScheduleInput,
  ): Promise<CreateUserScheduleResponse> {
    return this.schedulesService.createSchedule(
      input.user_id,
      input,
      user.id,
      user.role,
    );
  }

  @Query(() => GetUserCalenderAgendaResponse, { name: 'getUserCalenderAgenda' })
  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserCalenderAgenda(
    @Args() args: GetUserCalenderAgendaArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<GetUserCalenderAgendaResponse> {
    return this.schedulesService.getUserCalenderAgenda(args, lang);
  }

  @Query(() => GetUserCalenderAgendaResponse, {
    name: 'getDoctorCalenderAgenda',
  })
  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getDoctorCalenderAgenda(
    @GetUser() user: LoggedInUser,
    @Args() args: GetDoctorCalenderAgendaArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<GetDoctorCalenderAgendaResponse> {
    return this.schedulesService.getUserCalenderAgenda(
      {
        userId: user.id,
        startDate: args.startDate,
        endDate: args.endDate,
      },
      lang,
      args.filters,
    );
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UpdateScheduleResponse, {
    name: 'updateSchedule',
  })
  async updateSchedule(
    @GetUser() user: LoggedInUser,
    @Args('input') input: UpdateScheduleInput,
  ): Promise<UpdateScheduleResponse> {
    return await this.schedulesService.updateSchedule(
      user.id,
      user.id,
      user.role,
      input,
    );
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UpdateUserScheduleResponse, {
    name: 'updateUserSchedule',
  })
  async updateUserSchedule(
    @GetUser() user: LoggedInUser,
    @Args('input') input: UpdateUserScheduleInput,
  ): Promise<UpdateUserScheduleResponse> {
    return this.schedulesService.updateSchedule(
      input.user_id,
      user.id,
      user.role,
      input,
    );
  }
}
