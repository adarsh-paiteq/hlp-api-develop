import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  MembershipLevel,
  UserMembershipLevel,
} from '../membership-levels/membership-levels.dto';
import { ToolKit } from '../rewards/rewards.dto';
import { ScheduleSessionDto } from '../schedule-sessions/schedule-sessions.dto';
import { CheckInByCheckIn } from '../schedules/schedules.dto';
import { Trophy, UserTrophy } from '../trophies/trophies.dto';
import {
  Action,
  ActionDto,
  ActionType,
  ClaimActionsResponseDto,
  GetActionsParams,
  GetActionsResponseDto,
  UserAction,
  UserActionDto,
  UserCheckin,
} from './actions.dto';
import { ActionClaimedEvent, ActionsEvent } from './actions.event';
import { ActionsRepo, ActionTypesData } from './actions.repo';
import { nanoid } from 'nanoid';
import { UserMembershipStage } from '../membership-stages/entities/user-membership-stages.entity';
import { EmailsService } from '../emails/emails.service';
import { GetActionInfoResponse } from './dto/actions.dto';
import {
  ActionsDto,
  Actions,
  GetActionsResponse,
  CheckinsWithStatus,
  MembershipLevelCompletionStatus,
  ToolkitWithStatus,
} from './dto/get-user-action.dto';
import { ClaimActionResponse } from './dto/user-claim-action.dto';
import { TrophyWithStatus } from '../users/dto/get-user-score.dto';
import { TranslationService } from '@shared/services/translation/translation.service';
@Injectable()
export class ActionsService {
  private readonly logger = new Logger(ActionsService.name);
  constructor(
    private readonly actionsRepo: ActionsRepo,
    private readonly eventEmitter: EventEmitter2,
    private readonly emailsService: EmailsService,
    private readonly translationService: TranslationService,
  ) {}

  /**
   * @deprecated getUserActions Action are used for detrieves the user actions.This action is currently utilized within the app and has  been migrated getActions.
   */
  private mapActionsWithUserActions(
    actions: Action[],
    userActions: UserAction[],
    membershipStages: UserMembershipStage[],
  ): Action[] {
    const completedActions = userActions.map(
      (userAction) => userAction.action_id,
    );

    const mappedActions = actions.map((action) => {
      const isCompleted = completedActions.includes(action.id);
      const has_membership_stage = membershipStages.find(
        (userStage) =>
          userStage.membership_stage_id === action.membership_stage_id,
      );
      return {
        ...action,
        is_completed: isCompleted,
        has_membership_stage: has_membership_stage !== undefined,
      };
    });
    return mappedActions;
  }

  private mapActionsWithUserAction(
    actions: Actions[],
    userActions: UserAction[],
    membershipStages: UserMembershipStage[],
  ): Actions[] {
    const completedActions = userActions.map(
      (userAction) => userAction.action_id,
    );

    const mappedActions = actions.map((action) => {
      const isCompleted = completedActions.includes(action.id);
      const has_membership_stage = membershipStages.find(
        (userStage) =>
          userStage.membership_stage_id === action.membership_stage_id,
      );
      return {
        ...action,
        is_completed: isCompleted,
        has_membership_stage: has_membership_stage !== undefined,
      };
    });
    return mappedActions;
  }
  private checkActionLevels(
    action: Action,
    membershipLevels: UserMembershipLevel[],
  ): { canClaim: boolean; membershipLevels: MembershipLevel[] } {
    const userMembershipLevelIds = membershipLevels
      ? membershipLevels.map((level) => level.membership_level_id)
      : [];
    const actionLevels = action.action_levels.map(
      (actionLevel) => actionLevel.membership_level,
    );
    const canClaim =
      actionLevels.every((level) =>
        userMembershipLevelIds.includes(level.id),
      ) && action.has_membership_stage;
    const mappedLevels = actionLevels.map((level) => ({
      ...level,
      is_completed: userMembershipLevelIds.includes(level.id),
    }));
    return { canClaim, membershipLevels: mappedLevels };
  }

  private checkActionLevel(
    action: Actions,
    membershipLevels: UserMembershipLevel[],
  ): {
    canClaim: boolean;
    membershipLevels: MembershipLevelCompletionStatus[];
  } {
    const userMembershipLevelIds = membershipLevels
      ? membershipLevels.map((level) => level.membership_level_id)
      : [];
    const actionLevels = action.action_levels.map(
      (actionLevel) => actionLevel.membership_level,
    );
    const canClaim =
      actionLevels.every((level) =>
        userMembershipLevelIds.includes(level.id),
      ) && action.has_membership_stage;
    const mappedLevels = actionLevels.map((level) => ({
      ...level,
      is_completed: userMembershipLevelIds.includes(level.id),
    }));
    return { canClaim, membershipLevels: mappedLevels };
  }

  private checkActionTrophie(
    action: Actions,
    trophies: UserTrophy[],
  ): { canClaim: boolean; trophies: TrophyWithStatus[] } {
    const userTrophyIds = trophies
      ? trophies.map((trophy) => trophy.trophy_id)
      : [];
    const actionTrophies = action.action_trophies.map(
      (trophy) => trophy.trophy,
    );
    const canClaim =
      actionTrophies.every((trophy) => userTrophyIds.includes(trophy.id)) &&
      action.has_membership_stage;
    const mappedTrophies = actionTrophies.map((trophy) => ({
      ...trophy,
      is_completed: userTrophyIds.includes(trophy.id),
    }));
    return { canClaim, trophies: mappedTrophies };
  }

  private checkActionTrophies(
    action: Action,
    trophies: UserTrophy[],
  ): { canClaim: boolean; trophies: Trophy[] } {
    const userTrophyIds = trophies
      ? trophies.map((trophy) => trophy.trophy_id)
      : [];
    const actionTrophies = action.action_trophies.map(
      (trophy) => trophy.trophy,
    );
    const canClaim =
      actionTrophies.every((trophy) => userTrophyIds.includes(trophy.id)) &&
      action.has_membership_stage;
    const mappedTrophies = actionTrophies.map((trophy) => ({
      ...trophy,
      is_completed: userTrophyIds.includes(trophy.id),
    }));
    return { canClaim, trophies: mappedTrophies };
  }

  private checkActionToolkit(
    action: Actions,
    toolkits: ScheduleSessionDto[],
  ): { canClaim: boolean; toolkits: ToolkitWithStatus[] } {
    const userToolkitIds = toolkits
      ? toolkits.map((toolkit) => toolkit.tool_kit_id)
      : [];
    const actionToolkits = action.action_tool_kits.map(
      (actionToolkit) => actionToolkit.tool_kit,
    );
    const canClaim =
      actionToolkits.every((toolkit) => userToolkitIds.includes(toolkit.id)) &&
      action.has_membership_stage;
    const mappedToolkits = actionToolkits.map((toolkit) => ({
      ...toolkit,
      is_completed: userToolkitIds.includes(toolkit.id),
    }));
    return {
      canClaim,
      toolkits: mappedToolkits,
    };
  }

  private checkActionToolkits(
    action: Action,
    toolkits: ScheduleSessionDto[],
  ): { canClaim: boolean; toolkits: ToolKit[] } {
    const userToolkitIds = toolkits
      ? toolkits.map((toolkit) => toolkit.tool_kit_id)
      : [];
    const actionToolkits = action.action_tool_kits.map(
      (actionToolkit) => actionToolkit.tool_kit,
    );
    const canClaim =
      actionToolkits.every((toolkit) => userToolkitIds.includes(toolkit.id)) &&
      action.has_membership_stage;
    const mappedToolkits = actionToolkits.map((toolkit) => ({
      ...toolkit,
      is_completed: userToolkitIds.includes(toolkit.id),
    }));
    return {
      canClaim,
      toolkits: mappedToolkits,
    };
  }

  private checkActionCheckin(
    action: Actions,
    checkins: UserCheckin[],
  ): { canClaim: boolean; checkins: CheckinsWithStatus[] } {
    const userCheckInIds = checkins
      ? checkins.map((checkin) => checkin.check_in)
      : [];
    const actionCheckins = action.action_check_ins.map(
      (checkin) => checkin.check_in,
    );
    const canClaim =
      actionCheckins.every((checkin) => userCheckInIds.includes(checkin.id)) &&
      action.has_membership_stage;

    const mappedCheckins = actionCheckins.map((checkin) => ({
      ...checkin,
      is_completed: userCheckInIds.includes(checkin.id),
    }));
    return { canClaim, checkins: mappedCheckins };
  }

  private checkActionCheckins(
    action: Action,
    checkins: UserCheckin[],
  ): { canClaim: boolean; checkins: CheckInByCheckIn[] } {
    const userCheckInIds = checkins
      ? checkins.map((checkin) => checkin.check_in)
      : [];
    const actionCheckins = action.action_check_ins.map(
      (checkin) => checkin.check_in,
    );
    const canClaim =
      actionCheckins.every((checkin) => userCheckInIds.includes(checkin.id)) &&
      action.has_membership_stage;

    const mappedCheckins = actionCheckins.map((checkin) => ({
      ...checkin,
      is_completed: userCheckInIds.includes(checkin.id),
    }));
    return { canClaim, checkins: mappedCheckins };
  }

  private mapAction(
    action: Action,
    actionTypesData: ActionTypesData,
  ): ActionDto {
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      action_check_ins,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      action_tool_kits,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      action_trophies,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      action_levels,
      membership_stage,
      ...actionCopy
    } = action;
    const newAction: ActionDto = {
      ...actionCopy,
      can_claim: false,
      membership_stage_title: membership_stage.title,
      membership_stage_color_code: membership_stage.color_code,
    };
    if (action.action_type === ActionType.LEVEL && action.action_levels) {
      const { canClaim, membershipLevels } = this.checkActionLevels(
        action,
        actionTypesData.user_membership_levels,
      );
      newAction.can_claim = canClaim;
      newAction.membership_levels = membershipLevels;
    }
    if (action.action_type === ActionType.TOOL_KIT && action.action_tool_kits) {
      const { canClaim, toolkits } = this.checkActionToolkits(
        action,
        actionTypesData.user_schedule_sessions,
      );
      newAction.can_claim = canClaim;
      newAction.tool_kits = toolkits;
    }

    if (action.action_type === ActionType.CHECK_IN && action.action_check_ins) {
      const { canClaim, checkins } = this.checkActionCheckins(
        action,
        actionTypesData.user_check_ins,
      );
      newAction.checkins = checkins;
      newAction.can_claim = canClaim;
    }

    if (action.action_type === ActionType.TROPHIES && action.action_trophies) {
      const { canClaim, trophies } = this.checkActionTrophies(
        action,
        actionTypesData.user_trophies,
      );
      newAction.can_claim = canClaim;
      newAction.trophies = trophies;
    }
    return newAction;
  }

  private mapActions(
    action: Actions,
    actionTypesData: ActionTypesData,
  ): ActionsDto {
    const { membership_stage, ...actionCopy } = action;
    const newAction: ActionsDto = {
      ...actionCopy,
      can_claim: false,
      membership_stage_title: membership_stage.title,
      membership_stage_color_code: membership_stage.color_code,
    };
    if (action.action_type === ActionType.LEVEL && action.action_levels) {
      const { canClaim, membershipLevels } = this.checkActionLevel(
        action,
        actionTypesData.user_membership_levels,
      );
      newAction.can_claim = canClaim;
      newAction.membership_levels = membershipLevels;
    }
    if (action.action_type === ActionType.TOOL_KIT && action.action_tool_kits) {
      const { canClaim, toolkits } = this.checkActionToolkit(
        action,
        actionTypesData.user_schedule_sessions,
      );
      newAction.can_claim = canClaim;
      newAction.tool_kits = toolkits;
    }

    if (action.action_type === ActionType.CHECK_IN && action.action_check_ins) {
      const { canClaim, checkins } = this.checkActionCheckin(
        action,
        actionTypesData.user_check_ins,
      );
      newAction.checkins = checkins;
      newAction.can_claim = canClaim;
    }

    if (action.action_type === ActionType.TROPHIES && action.action_trophies) {
      const { canClaim, trophies } = this.checkActionTrophie(
        action,
        actionTypesData.user_trophies,
      );
      newAction.can_claim = canClaim;
      newAction.trophies = trophies;
    }
    return newAction;
  }
  /**
   * @deprecated getUserActions Action are used for detrieves the user actions.This action is currently utilized within the app and has  been migrated getActions.
   */
  async getActions(params: GetActionsParams): Promise<GetActionsResponseDto> {
    const { id: userId } = params;
    const { actions, user_actions, membership_stages } =
      await this.actionsRepo.getActionsAndUserActions(userId);
    const mappedActions = this.mapActionsWithUserActions(
      actions,
      user_actions,
      membership_stages,
    );
    const actionTypesData = await this.actionsRepo.getActionTypesData(userId);
    const finalActions = mappedActions.map((action) =>
      this.mapAction(action, actionTypesData),
    );
    return { actions: finalActions };
  }

  async getAction(userId: string): Promise<GetActionsResponse> {
    const { actions, user_actions, membership_stages } =
      await this.actionsRepo.getActionsAndUserAction(userId);
    const mappedActions = this.mapActionsWithUserAction(
      actions,
      user_actions,
      membership_stages,
    );
    const actionTypesData = await this.actionsRepo.getActionsTypesData(userId);
    const finalActions = mappedActions.map((action) =>
      this.mapActions(action, actionTypesData),
    );
    return { actions: finalActions };
  }

  /**
   * @deprecated getUserActions Action are used for detrieves the user actions.This action is currently utilized within the app and has  been migrated getActions.
   */
  async claimAction(
    userId: string,
    actionId: string,
  ): Promise<ClaimActionsResponseDto> {
    this.logger.log(userId, actionId);
    const [{ actions, user_actions, membership_stages }, actionTypesData] =
      await Promise.all([
        this.actionsRepo.getActionAndUserActions(userId, actionId),
        this.actionsRepo.getActionTypesData(userId),
      ]);
    if (!actions.length) {
      throw new NotFoundException(`actions.action_not_found`);
    }
    const mappedActions = this.mapActionsWithUserActions(
      actions,
      user_actions,
      membership_stages,
    );
    const [action] = mappedActions.map((action) =>
      this.mapAction(action, actionTypesData),
    );
    if (action.is_completed) {
      throw new BadRequestException(`actions.already_claim_action`);
    }
    if (!action.can_claim) {
      throw new BadRequestException(`actions.unable_claim_action`);
    }
    const voucherCode = nanoid(8);
    const userAction: UserActionDto = {
      action_id: actionId,
      user_id: userId,
      voucher_code: voucherCode,
    };
    const savedUserAction = await this.actionsRepo.saveUserAction(userAction);

    this.eventEmitter.emit(
      ActionsEvent.ACTION_CLAIMED,
      new ActionClaimedEvent(savedUserAction),
    );
    return {
      data: savedUserAction,
    };
  }

  async getActionInfo(
    userId: string,
    actionId: string,
    lang?: string,
  ): Promise<GetActionInfoResponse> {
    const actionInfo = await this.actionsRepo.getActionInfo(userId, actionId);
    if (!actionInfo) {
      throw new NotFoundException(`actions.action_info_not_found`);
    }
    const [translatedActionInfo] =
      this.translationService.getTranslations<GetActionInfoResponse>(
        [actionInfo],
        ['title', 'sub_title', 'short_description', 'description'],
        lang,
      );
    return translatedActionInfo;
  }
  async userClaimAction(
    userId: string,
    actionId: string,
  ): Promise<ClaimActionResponse> {
    this.logger.log(userId, actionId);
    const [{ actions, user_actions, membership_stage }, actionTypesData] =
      await Promise.all([
        this.actionsRepo.getActionAndUserAction(userId, actionId),
        this.actionsRepo.getActionsTypesData(userId),
      ]);
    if (!actions.length) {
      throw new NotFoundException(`actions.action_not_found`);
    }
    const mappedActions = this.mapActionsWithUserAction(
      actions,
      user_actions,
      membership_stage,
    );
    const [action] = mappedActions.map((action) =>
      this.mapActions(action, actionTypesData),
    );
    if (action.is_completed) {
      throw new BadRequestException(`actions.already_claim_action`);
    }
    if (!action.can_claim) {
      throw new BadRequestException(`actions.unable_claim_action`);
    }
    const voucherCode = nanoid(8);
    const userAction: UserActionDto = {
      action_id: actionId,
      user_id: userId,
      voucher_code: voucherCode,
    };
    const savedUserAction = await this.actionsRepo.saveUserActions(userAction);

    this.eventEmitter.emit(
      ActionsEvent.ACTION_CLAIMED,
      new ActionClaimedEvent(savedUserAction),
    );
    return {
      data: savedUserAction,
    };
  }
}
