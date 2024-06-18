import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Roles } from '@shared/decorators/roles.decorator';
import { JwtAuthGuard } from '@shared/guards/auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { LoggedInUser } from '@shared/auth/jwt.strategy';
import { UserRoles } from '../users/users.dto';
import { RobotsService } from './robots.service';
import { GetUser } from '@shared/decorators/user.decorator';
import { GetRobotsArgsDto, GetRobotsResponseDto } from './dto/robots.dto';
import {
  AddFlowChartRobotResponse,
  FlowChartRobotInput,
} from './dto/add-flow-chart-robot.dto';
import {
  UpdateFlowChartRobotArgs,
  UpdateFlowChartRobotInput,
  UpdateFlowChartRobotResponse,
} from './dto/update-flow-chrat-robot.dto';
import {
  DeleteFlowChartResponse,
  DeleteFlowChartRobotArgs,
} from './dto/delete-flow-chart-robot';
import {
  GetFlowChartRobotArgs,
  GetFlowChartRobotResponse,
} from './dto/get-flow-chart-robot.dto';
import {
  AddFlowChartRobotLogArgs,
  AddFlowChartRobotLogResponse,
} from './dto/add-flow-chart-robot-log.dto';
import { I18nNextLanguage } from '@shared/decorators/language.decorator';
import {
  UpdateTreatmentTimelineRobotStatusArgs,
  UpdateTreatmentTimelineRobotStatusResponse,
} from './dto/update-treatment-timeline-robot-status.dto';

@Resolver()
export class RobotsResolver {
  constructor(private readonly robotsService: RobotsService) {}

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetRobotsResponseDto, { name: 'getRobots' })
  async getRobots(
    @GetUser() user: LoggedInUser,
    @Args() args: GetRobotsArgsDto,
    @I18nNextLanguage() lang: string,
  ): Promise<GetRobotsResponseDto> {
    return this.robotsService.getRobots(user.id, args.date, args.page, lang);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => AddFlowChartRobotResponse, { name: 'addFlowChartRobot' })
  async addFlowChartRobot(
    @Args('robot') robot: FlowChartRobotInput,
  ): Promise<AddFlowChartRobotResponse> {
    return this.robotsService.addFlowChartRobot(robot);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UpdateFlowChartRobotResponse, {
    name: 'updateFlowChartRobot',
  })
  async updateFlowChartRobot(
    @Args() args: UpdateFlowChartRobotArgs,
    @Args('robot') robot: UpdateFlowChartRobotInput,
  ): Promise<UpdateFlowChartRobotResponse> {
    return this.robotsService.updateFlowChartRobot(args.id, robot);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => DeleteFlowChartResponse, { name: 'deleteFlowChartRobot' })
  async deleteFlowChartRobot(
    @Args() args: DeleteFlowChartRobotArgs,
  ): Promise<DeleteFlowChartResponse> {
    return this.robotsService.deleteFlowChartRobot(args.id);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => GetFlowChartRobotResponse, { name: 'getFlowChartRobot' })
  async getFlowChartRobot(
    @Args() args: GetFlowChartRobotArgs,
    @GetUser() user: LoggedInUser,
  ): Promise<GetFlowChartRobotResponse> {
    return this.robotsService.getFlowChartRobot(user.id, args);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => AddFlowChartRobotLogResponse, {
    name: 'completeFlowChartRobot',
  })
  async addFlowChartRobotLog(
    @Args() args: AddFlowChartRobotLogArgs,
    @GetUser() user: LoggedInUser,
  ): Promise<AddFlowChartRobotLogResponse> {
    return this.robotsService.addFlowChartRobotLog(user.id, args.id);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => AddFlowChartRobotLogResponse, {
    name: 'updateTreatmentTimelineRobotStatus',
  })
  async updateTreatmentTimelineRobotStatus(
    @Args() args: UpdateTreatmentTimelineRobotStatusArgs,
    @GetUser() user: LoggedInUser,
  ): Promise<UpdateTreatmentTimelineRobotStatusResponse> {
    return await this.robotsService.updateTreatmentTimelineRobotStatus(
      user.id,
      args.is_robot_read,
      args.notification_id,
    );
  }
}
