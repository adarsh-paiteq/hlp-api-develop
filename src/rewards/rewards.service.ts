import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GoalsRepo } from '../goals/goals.repo';
import { GoalLevel, UserGoalLevel } from '../goals/goals.dto';
import { MembershipLevelsRepo } from '../membership-levels/membership-levels.repo';
import { MembershipStagesRepo } from '../membership-stages/membership-stages.repo';
import { UserStreak } from '../streaks/streaks.dto';
import { UserDonation } from '../users/users.dto';
import {
  AddMembershipLevelRewardDto,
  AddMembershipStageRewardDto,
  ChannelFollowedReward,
  ChannelPostReactionReward,
  ChannelPostReward,
  GoalLevelReward,
  MembershipLevelReward,
  MembershipStageReward,
  RewardType,
  StreakReward,
  ToolKitReward,
  UserBalance,
  UserDonationReward,
  TrophyAchievedReward,
  CheckinReward,
  BlogReadReward,
  BonusesReward,
  ChallengeReward,
  ChannelPostThankYouReward,
  ChallengeWonReward,
  AdminPostReadReward,
  UserMoodCheckReward,
  UserFormAnswerReward,
  UserToolKitReward,
  RewardUserCheckinLevel,
} from './rewards.dto';
import { RewardAddedEvent, RewardEvent } from './rewards.event';
import { RewardsRepo } from './rewards.repo';
import { ChannelPostReaction, ChannelRewards } from '../channels/channels.dto';
import { UserTrophy } from '../trophies/trophies.dto';
import { UserCheckinLevel } from '../checkins/checkins.dto';
import { UsersRepo } from '../users/users.repo';
import { UserBlogRead } from '../blog-posts/blogs-posts.model';
import { Bonus, UserBonus } from '../bonuses/bonuses.dto';
import { UserChallenges } from '../challenges/challenges.dto';
import { PostThankYouEvent } from '../channels/channels.event';
import { ChallengeWonEvent } from '../challenges/challenges.event';
import { ChannelUserPost } from '../channels/entities/channel-user-posts.entity';
import { AdminPostRead } from '../admin-post-reads/entities/admin-post-read.entity';
import { UserMoodCheck } from '../user-mood-checks/entities/user-mood-check.entity';
import { UserChannel } from '../channels/entities/user-channel.entity';
import { CommonRespMessage, UserRewards } from './entities/user-rewards.entity';
import { UserFormAnswer } from '../forms/entities/user-form-answer.entity';
import { FormsRepo } from '../forms/forms.repo';
import { Toolkit, ToolkitType } from '../toolkits/toolkits.model';
import { TranslationService } from '@shared/services/translation/translation.service';
import { Channel } from '@channels/entities/channel.entity';
import { Users } from '@users/users.model';
import { MembershipStage as MembershipStageNew } from '@membership-stages/membership-stages.model';
import { Form } from '@forms/entities/form.entity';
import { MoodCheckCategory } from '@user-mood-checks/entities/mood-check-category.entity';
import { ChallengeResponse } from '@challenges/challenges.model';
import { Trophy } from '@trophies/entities/trophy.entity';
import { MembershipLevel } from '@membership-levels/membership-levels.dto';

@Injectable()
export class RewardsService {
  private readonly logger = new Logger(RewardsService.name);
  constructor(
    private readonly rewardsRepo: RewardsRepo,
    private readonly eventEmitter: EventEmitter2,
    private readonly membershipStageRepo: MembershipStagesRepo,

    private readonly membershipLevelRepo: MembershipLevelsRepo,
    private readonly goalsRepo: GoalsRepo,
    private readonly usersRepo: UsersRepo,
    private readonly formsRepo: FormsRepo,
    private readonly translationService: TranslationService,
  ) {}

  /**
   * @description The service utilized in the @function addToolKitIdReward() function, which is responsible for adding toolkit rewards.
   */
  async addToolKitReward(userId: string, toolKitId: string): Promise<void> {
    const toolKit = await this.rewardsRepo.getToolKitById(toolKitId);
    if (!toolKit) {
      throw new NotFoundException(`Toolkit Not found`);
    }

    const translations = this.translationService.getDataTranslations<Toolkit>(
      [toolKit],
      ['title'],
      ['reward.title.tool_completed'],
    );

    const toolKitReward: ToolKitReward = {
      user_id: userId,
      tool_kit_id: toolKit.id,
      hlp_reward_points_awarded: toolKit.tool_kit_hlp_reward_points,
      reward_type: RewardType.TOOL_KIT,
      title: translations.nl['title'],
      translations,
    };

    const newToolKitReward = await this.rewardsRepo.addReward(toolKitReward);
    this.logger.log(toolKitReward);
    this.eventEmitter.emit(
      RewardEvent.REWARD_ADDED,
      new RewardAddedEvent(newToolKitReward),
    );
  }

  async addUserToolKitReward(
    userId: string,
    userToolKitId: string,
  ): Promise<string> {
    const userToolKit = await this.rewardsRepo.getUserToolKitById(
      userToolKitId,
      userId,
    );

    if (!userToolKit) {
      return `User Toolkit Not found`;
    }

    const translations = this.translationService.getEnglishAndDutchTranslations(
      ['reward.title.user_toolkit_completed'],
      { title: userToolKit.title },
    );

    const userToolkiReward: UserToolKitReward = {
      user_id: userId,
      user_toolkit_id: userToolKit.id,
      hlp_reward_points_awarded: 1,
      reward_type: RewardType.USER_TOOLKIT,
      title: translations.nl['title'],
      translations,
    };

    const newUserToolKitReward = await this.rewardsRepo.addReward(
      userToolkiReward,
    );

    this.eventEmitter.emit(
      RewardEvent.REWARD_ADDED,
      new RewardAddedEvent(newUserToolKitReward),
    );
    return `User Toolkit Reward Added`;
  }

  /**
   * @description The service utilized in the @function addStreakReward() function, which is responsible for adding straks rewards.
   */
  async addStreakReward(userStreak: UserStreak): Promise<string> {
    const streakAndToolkit = await this.rewardsRepo.getStreakAndToolkit(
      userStreak.streak_id,
    );
    if (!streakAndToolkit) {
      this.logger.warn(`no streak fo`);
      return `No streak Found`;
    }
    const { toolkit, tool_kit, streak_points } = streakAndToolkit;

    const translations = this.translationService.getDataTranslations<Toolkit>(
      [toolkit],
      ['title'],
      ['reward.title.streak_completed'],
    );

    const streakReward: StreakReward = {
      user_id: userStreak.user_id,
      tool_kit_id: tool_kit,
      hlp_reward_points_awarded: streak_points,
      reward_type: RewardType.STREAK,
      streak_id: userStreak.streak_id,
      title: translations.nl['title'],
      translations,
    };

    const newStreakReward = await this.rewardsRepo.addReward(streakReward);
    if (!newStreakReward) {
      return `Failed to add streak reward`;
    }
    this.eventEmitter.emit(
      RewardEvent.REWARD_ADDED,
      new RewardAddedEvent(newStreakReward),
    );
    return `Streak Reward Added`;
  }

  /**
   * @description The service utilized in the @function addStageReward() function, which is responsible for adding stage rewards.
   */
  async addMembershipStageReward(
    body: AddMembershipStageRewardDto,
  ): Promise<string> {
    const { membership_stage_id, user_id } = body;

    const [membershipStage, membershipStageReward] = await Promise.all([
      this.membershipStageRepo.getMembershipStageById(membership_stage_id),
      this.rewardsRepo.getMembershipStageReward(user_id, membership_stage_id),
    ]);

    if (!membershipStage) {
      return `Membership stage not found ${membership_stage_id}`;
    }

    if (membershipStageReward) {
      return `Membership stage reward already claimed ${membershipStageReward.id}`;
    }

    const translations =
      this.translationService.getDataTranslations<MembershipStageNew>(
        [membershipStage],
        ['title'],
        ['reward.title.membership_status_upgraded'],
      );

    const stageReward: MembershipStageReward = {
      user_id,
      membership_stage_id,
      hlp_reward_points_awarded: membershipStage.hlp_reward_points,
      reward_type: RewardType.MEMBER_STAGE,
      title: translations.nl['title'],
      translations,
    };

    const newStageReward = await this.rewardsRepo.addReward(stageReward);

    this.eventEmitter.emit(
      RewardEvent.REWARD_ADDED,
      new RewardAddedEvent(newStageReward),
    );
    return `New stage reward added ${newStageReward.id}`;
  }

  /**
   * @description The service utilized in the @function addLevelReward() function, which is responsible for adding level rewards.
   */
  async addMembershipLevelReward(
    body: AddMembershipLevelRewardDto,
  ): Promise<string> {
    const { membership_level_id, user_id } = body;

    const membershipLevel =
      await this.membershipLevelRepo.getMembershipLevelById(
        membership_level_id,
      );

    if (!membershipLevel) {
      const message = `Membership stage not found ${membership_level_id}`;
      this.logger.log(message);
      return message;
    }

    const existingReward =
      await this.membershipLevelRepo.getUserMembershipLevel(
        user_id,
        membership_level_id,
      );

    if (existingReward) {
      const message = `Membership level rewards already claimed ${existingReward.id}`;
      this.logger.log(message);
      return message;
    }

    const translations =
      this.translationService.getDataTranslations<MembershipLevel>(
        [membershipLevel],
        ['title'],
        ['reward.title.membership_level_completed'],
      );

    const levelReward: MembershipLevelReward = {
      user_id,
      membership_level_id,
      hlp_reward_points_awarded: membershipLevel.hlp_reward_points,
      reward_type: RewardType.LEVEL_COMPLETION,
      title: translations.nl['title'],
      translations,
    };
    const newLevelReward = await this.rewardsRepo.addReward(levelReward);
    const message = `New level reward added ${newLevelReward.id}`;
    this.logger.log(message);
    this.eventEmitter.emit(
      RewardEvent.REWARD_ADDED,
      new RewardAddedEvent(newLevelReward),
    );
    return message;
  }

  async getUserBalance(userId: string): Promise<UserBalance> {
    const { earned, received } = await this.rewardsRepo.getUserBalance(userId);
    const totalBalance = earned + received;
    const balance: UserBalance = {
      total: totalBalance,
      received,
      earned,
    };
    return balance;
  }

  async addDonationReward(body: UserDonation): Promise<string> {
    const {
      id: donationId,
      receiver_user_id: userId,
      hlp_reward_points_donated: points,
      donor_user_id: donorUserId,
    } = body;
    const donation = await this.rewardsRepo.getRewardByDonationId(
      donationId as string,
    );
    if (donation) {
      const message = `Donation reward already exists`;
      this.logger.warn(message);
      return message;
    }
    const user = await this.usersRepo.getUserById(donorUserId);

    const trenslateRecievedTextEn = this.translationService.translate(
      `reward-content.recieved`,
      {},
      'en',
    );

    const trenslateRecievedTextNl = this.translationService.translate(
      `reward-content.recieved`,
      {},
      'nl',
    );
    const trenslateHlpFromTextEn = this.translationService.translate(
      `reward-content.coins_from`,
      {},
      'en',
    );

    const trenslateHlpFromTextNl = this.translationService.translate(
      `reward-content.coins_from`,
      {},
      'nl',
    );

    const enTitle = `${trenslateRecievedTextEn} ${points} ${trenslateHlpFromTextEn} ${user.full_name}`;
    const nlTitle = `${trenslateRecievedTextNl} ${points} ${trenslateHlpFromTextNl} ${user.full_name}`;

    const translations = this.getRewardTranslations(enTitle, nlTitle);

    const donationReward: UserDonationReward = {
      user_id: userId,
      user_donation_id: donationId as string,
      hlp_reward_points_awarded: points,
      reward_type: RewardType.HLP_DONATION,
      title: nlTitle,
      translations,
    };
    const newDonationReward = await this.rewardsRepo.addReward(donationReward);
    const message = `New donation reward added ${newDonationReward.id}`;
    this.logger.log(message);
    this.eventEmitter.emit(
      RewardEvent.REWARD_ADDED,
      new RewardAddedEvent(newDonationReward),
    );
    return message;
  }

  async addGoalLevelReward(body: UserGoalLevel): Promise<string> {
    const { goal_level_id, user_id } = body;

    const userReward = await this.rewardsRepo.getUserGoalLevelReward(
      user_id,
      goal_level_id,
    );

    if (userReward) {
      const message = `User Goal Level Reward already added`;
      this.logger.log(message);
      return message;
    }

    const goalLevel = await this.goalsRepo.getGoalLevelById(goal_level_id);

    if (!goalLevel) {
      const message = `Goal Level Not found ${goalLevel}`;
      this.logger.log(message);
      return message;
    }

    const translations = this.translationService.getDataTranslations<GoalLevel>(
      [goalLevel],
      ['title'],
      ['reward.title.goal_level_completed'],
    );

    const goalLevelReward: GoalLevelReward = {
      user_id,
      goal_level_id,
      hlp_reward_points_awarded: goalLevel.hlp_reward_points_to_be_awarded,
      reward_type: RewardType.GOAL_LEVEL,
      title: translations.nl['title'],
      translations,
    };

    const newGoalLevelReward = await this.rewardsRepo.addReward(
      goalLevelReward,
    );

    const message = `New Goal level reward added ${newGoalLevelReward.id}`;
    this.logger.log(message);

    this.eventEmitter.emit(
      RewardEvent.REWARD_ADDED,
      new RewardAddedEvent(newGoalLevelReward),
    );
    return message;
  }

  async addchannelFollowedReward(body: UserChannel): Promise<string> {
    const { channel_id, user_id } = body;
    const userReward = await this.rewardsRepo.getChannelFollowedReward(
      user_id,
      channel_id,
      RewardType.FOLLOW_CHANNEL,
    );
    if (userReward) {
      return `Reward already added`;
    }

    const channel = await this.rewardsRepo.getChannelById(channel_id);

    if (!channel) {
      return `Channel Not found ${channel_id}`;
    }

    const [translatedChannelEn] =
      this.translationService.getTranslations<Channel>(
        [channel],
        ['title'],
        'en',
      );

    const [translatedChannelNl] =
      this.translationService.getTranslations<Channel>(
        [channel],
        ['title'],
        'nl',
      );

    const trenslateFollowedTextEn = this.translationService.translate(
      `reward-content.followed`,
      {},
      'en',
    );

    const trenslateFollowedTextNl = this.translationService.translate(
      `reward-content.followed`,
      {},
      'nl',
    );

    const trenslateGroupTextEn = this.translationService.translate(
      `reward-content.group`,
      {},
      'en',
    );

    const trenslateGroupTextNl = this.translationService.translate(
      `reward-content.group`,
      {},
      'nl',
    );

    const enTitle = `${trenslateFollowedTextEn} ${translatedChannelEn.title} ${trenslateGroupTextEn}`;
    const nlTitle = `${trenslateFollowedTextNl} ${translatedChannelNl.title} ${trenslateGroupTextNl}`;

    const translations = this.getRewardTranslations(enTitle, nlTitle);

    const channelFollowedReward: ChannelFollowedReward = {
      user_id,
      channel_id,
      hlp_reward_points_awarded: ChannelRewards.HLP_POINTS_FOR_CHANNEL_FOLLOWED,
      reward_type: RewardType.FOLLOW_CHANNEL,
      title: nlTitle,
      translations,
    };
    const newChannelFollowedReward = await this.rewardsRepo.addReward(
      channelFollowedReward,
    );

    this.eventEmitter.emit(
      RewardEvent.REWARD_ADDED,
      new RewardAddedEvent(newChannelFollowedReward),
    );
    return `Channel Followed Reward added ${newChannelFollowedReward.id}`;
  }

  async addchannelPostReward(
    channelUserPost: ChannelUserPost,
  ): Promise<string> {
    const { id: channelPostId, user_id: userId, channel_id } = channelUserPost;
    const postReward = await this.rewardsRepo.getChannelPostReward(
      userId,
      channelPostId,
      RewardType.CHANNEL_POST,
    );
    if (postReward) {
      return `Reward already added`;
    }

    const trenslateTextEn = this.translationService.translate(
      `reward-content.created_post`,
      {},
      'en',
    );

    const trenslateTextNl = this.translationService.translate(
      `reward-content.created_post`,
      {},
      'nl',
    );

    const enTitle = `${trenslateTextEn}`;
    const nlTitle = `${trenslateTextNl}`;

    const translations = this.getRewardTranslations(enTitle, nlTitle);
    const channelPostReward: ChannelPostReward = {
      user_id: userId,
      channel_post_id: channelPostId,
      hlp_reward_points_awarded: ChannelRewards.HLP_POINTS_FOR_CHANNEL_POST,
      reward_type: RewardType.CHANNEL_POST,
      title: nlTitle,
      channel_id: channel_id,
      translations,
    };
    const newChannelPostReward = await this.rewardsRepo.addReward(
      channelPostReward,
    );

    this.eventEmitter.emit(
      RewardEvent.REWARD_ADDED,
      new RewardAddedEvent(newChannelPostReward),
    );
    return `Channel Post reward added ${newChannelPostReward.id}`;
  }

  async addchannelPostReactionReward(
    body: ChannelPostReaction,
  ): Promise<string> {
    const { id, user_id } = body;
    const channelPostReactionDeails =
      await this.rewardsRepo.getUserPostReaction(id, user_id);
    if (!channelPostReactionDeails) {
      const message = `User Channel Post Reaction Not found ${id}`;
      this.logger.log(message);
      return message;
    }

    const translations = this.translationService.getEnglishAndDutchTranslations(
      ['reward.title.reacted_to_post'],
    );
    const channelPostReactionReward: ChannelPostReactionReward = {
      user_id,
      post_reaction_id: id,
      hlp_reward_points_awarded:
        ChannelRewards.HLP_POINTS_FOR_CHANNEL_POST_REACTION,
      reward_type: RewardType.CHANNEL_POST_REACTION,
      title: translations.nl['title'],
      translations,
    };
    const newChannelPostReactionReward = await this.rewardsRepo.addReward(
      channelPostReactionReward,
    );
    const message = `User Channel Post reaction reward added ${newChannelPostReactionReward.id}`;
    this.logger.log(message);
    this.eventEmitter.emit(
      RewardEvent.REWARD_ADDED,
      new RewardAddedEvent(newChannelPostReactionReward),
    );
    return message;
  }

  async addTrophyAchievedReward(body: UserTrophy): Promise<string> {
    const { id: userTophyId, trophy_id, user_id } = body;

    const trophyReward = await this.rewardsRepo.getUserTrophyReward(
      user_id,
      trophy_id,
      RewardType.TROPHY,
    );

    if (trophyReward) {
      return `Reward already added`;
    }

    const trophy = await this.rewardsRepo.getUserAchivedTrophy(userTophyId);

    if (!trophy) {
      throw new NotFoundException(`User Achieved Trophy Not found`);
    }

    const { id: trophyId, hlp_reward_points } = trophy;

    const translations = this.translationService.getDataTranslations<Trophy>(
      [trophy],
      ['title'],
      ['reward.title.trophy_won'],
    );

    const trophyAchievedReward: TrophyAchievedReward = {
      user_id,
      trophy_id: trophyId,
      hlp_reward_points_awarded: hlp_reward_points,
      reward_type: RewardType.TROPHY,
      title: translations.nl['title'],
      translations,
    };

    const newTrophyAchievedReward = await this.rewardsRepo.addReward(
      trophyAchievedReward,
    );

    if (!newTrophyAchievedReward) {
      throw new BadRequestException(
        `Failed to save User Trophy Achieved reward ${JSON.stringify(
          trophyAchievedReward,
        )}`,
      );
    }

    this.eventEmitter.emit(
      RewardEvent.REWARD_ADDED,
      new RewardAddedEvent(newTrophyAchievedReward),
    );
    return `User Trophy Achieved reward added`;
  }

  async addCheckindReward(body: UserCheckinLevel): Promise<string> {
    const { check_in_level_id, user_id } = body;
    const userCheckinLevel = await this.rewardsRepo.getUserCheckinLevel(
      check_in_level_id,
      user_id,
    );
    if (!userCheckinLevel) {
      const message = `User Checkin Level Not found ${check_in_level_id}`;
      return message;
    }

    const translations =
      this.translationService.getDataTranslations<RewardUserCheckinLevel>(
        [userCheckinLevel],
        ['title'],
        ['reward.title.checkin_log_completed'],
      );

    const userCheckinReward: CheckinReward = {
      user_id,
      checkin_level_id: check_in_level_id,
      hlp_reward_points_awarded:
        userCheckinLevel.hlp_reward_points_to_be_awarded,
      reward_type: RewardType.CHECKIN_LEVEL,
      title: translations.nl['title'],
      translations,
    };
    const newCheckinReward = await this.rewardsRepo.addReward(
      userCheckinReward,
    );

    if (!newCheckinReward) {
      const message = `failed to save User Checkin reward ${JSON.stringify(
        userCheckinReward,
      )}`;
      return message;
    }
    const message = `User Checkin reward added ${newCheckinReward.id}`;
    this.eventEmitter.emit(
      RewardEvent.REWARD_ADDED,
      new RewardAddedEvent(newCheckinReward),
    );
    return message;
  }

  getRewardTranslations(enTitle: string, nlTitle: string) {
    const translations = {
      en: {
        title: enTitle,
      },
      nl: {
        title: nlTitle,
      },
    };
    return translations;
  }

  async addBlogReadReward(body: UserBlogRead): Promise<string> {
    const { blog_id, user_id } = body;
    const [userBlogRead] = await this.rewardsRepo.getUserBlogRead(
      user_id,
      blog_id,
    );
    if (!userBlogRead) {
      const message = `User blog read Not found ${blog_id}`;
      return message;
    }

    const [userBlogReadRewardExists] =
      await this.rewardsRepo.getUserRewardsForBlogRead(user_id, blog_id);
    if (userBlogReadRewardExists) {
      return `User Reward Already Achieved ${
        JSON.stringify(userBlogReadRewardExists, undefined, 4) //Prettyfied
      }`;
    }

    const [translatedUserBlogEn] =
      this.translationService.getTranslations<UserBlogRead>(
        [userBlogRead],
        ['title'],
        'en',
      );

    const [translatedUserBlogNl] =
      this.translationService.getTranslations<UserBlogRead>(
        [userBlogRead],
        ['title'],
        'nl',
      );

    const trenslateTextEn = this.translationService.translate(
      `reward-content.read_completed`,
      {},
      'en',
    );

    const trenslateTextNl = this.translationService.translate(
      `reward-content.read_completed`,
      {},
      'nl',
    );

    const enTitle = `${translatedUserBlogEn.title} ${trenslateTextEn}`;
    const nlTitle = `${translatedUserBlogNl.title} ${trenslateTextNl}`;

    const translations = this.getRewardTranslations(enTitle, nlTitle);

    const userBlogReadReward: BlogReadReward = {
      user_id,
      blog_id: blog_id,
      hlp_reward_points_awarded: 1,
      reward_type: RewardType.BLOG_READ,
      title: nlTitle,
      translations,
    };
    const newBlogReadReward = await this.rewardsRepo.addReward(
      userBlogReadReward,
    );

    if (!newBlogReadReward) {
      const message = `failed to save user blog read reward ${JSON.stringify(
        userBlogReadReward,
        undefined,
        4,
      )}`;
      return message;
    }
    const message = `User blog read completed ${newBlogReadReward.id}`;
    this.eventEmitter.emit(
      RewardEvent.REWARD_ADDED,
      new RewardAddedEvent(newBlogReadReward),
    );
    return message;
  }
  async addBonusClaimedReward(body: UserBonus): Promise<string> {
    const { bonus_id, user_id } = body;
    const [userBonuses] = await this.rewardsRepo.getUserBonuses(
      user_id,
      bonus_id,
    );
    if (!userBonuses) {
      const message = `User bonus Not found ${bonus_id}`;
      return message;
    }

    const [userBonusesRewardExists] =
      await this.rewardsRepo.getUserRewardsForBonusClaimed(user_id, bonus_id);
    if (userBonusesRewardExists) {
      return `User Reward Already Achieved ${
        JSON.stringify(userBonusesRewardExists, undefined, 4) //Prettyfied
      }`;
    }
    const bonus = await this.rewardsRepo.getBonusById(bonus_id);

    const translations = this.translationService.getDataTranslations<Bonus>(
      [bonus],
      ['title'],
      ['reward.title.bonus_claimed'],
    );

    const userBonusesReward: BonusesReward = {
      user_id,
      bonus_id: bonus_id,
      hlp_reward_points_awarded: bonus.hlp_reward_points,
      reward_type: RewardType.BONUS_CLAIMED,
      title: translations.nl['title'],
      translations,
    };
    const newBonusesReward = await this.rewardsRepo.addReward(
      userBonusesReward,
    );

    if (!newBonusesReward) {
      const message = `failed to save user bonuses reward ${JSON.stringify(
        userBonuses,
        undefined,
        4,
      )}`;
      return message;
    }
    const message = `User bonus claimed ${newBonusesReward.id}`;
    this.eventEmitter.emit(
      RewardEvent.REWARD_ADDED,
      new RewardAddedEvent(newBonusesReward),
    );
    return message;
  }
  async addChallengeGoalCompletedReward(
    userChallenge: UserChallenges,
  ): Promise<string> {
    const { user_id, challenge_id, hlp_points_earned_for_completing_goal } =
      userChallenge;

    const challenge = await this.rewardsRepo.getChallengeById(challenge_id);

    if (!challenge) {
      return `Challenge Not Found `;
    }

    const userChallenegGoalReward =
      await this.rewardsRepo.getUserChallengeRewards(
        user_id,
        challenge_id,
        RewardType.CHALLENGE_GOAL_COMPLETION,
      );

    if (userChallenegGoalReward) {
      return `Challenge Goal Completion reward Already Added`;
    }

    const translations =
      this.translationService.getDataTranslations<ChallengeResponse>(
        [challenge],
        ['title'],
        ['reward.title.challenge_goal_completed'],
      );

    const userChallengeReward: ChallengeReward = {
      user_id: user_id,
      challenge_id: challenge_id,
      hlp_reward_points_awarded: hlp_points_earned_for_completing_goal,
      reward_type: RewardType.CHALLENGE_GOAL_COMPLETION,
      title: translations.nl['title'],
      translations,
    };

    const newChallengeReward = await this.rewardsRepo.addReward(
      userChallengeReward,
    );

    if (!newChallengeReward) {
      return `Failed To Save ${user_id} Challenge Goal Completion Reward`;
    }

    this.eventEmitter.emit(
      RewardEvent.REWARD_ADDED,
      new RewardAddedEvent(newChallengeReward),
    );
    return `Added Challenge Goal Completion Reward ${newChallengeReward.id}`;
  }

  async addChannelPostThankYouReward(body: PostThankYouEvent): Promise<string> {
    const {
      postThankYou: { donor_user_id, post_id, hlp_reward_points_donated },
    } = body;

    const userChannelPost = await this.rewardsRepo.getUserPostByPostId(
      post_id as string,
    );

    if (!userChannelPost) {
      const message = `User Channel Post Not found ${post_id}`;
      this.logger.log(message);
      return message;
    }
    const translations = this.translationService.getEnglishAndDutchTranslations(
      ['reward.title.someone_thanked_you'],
      { title: userChannelPost.message },
    );

    const channelPostThankYouReward: ChannelPostThankYouReward = {
      user_id: donor_user_id,
      channel_post_id: post_id,
      hlp_reward_points_awarded: hlp_reward_points_donated,
      reward_type: RewardType.CHANNEL_POST_THANK_YOU,
      title: translations.nl['title'],
      translations,
    };

    const newChannelPostThankYouReward = await this.rewardsRepo.addReward(
      channelPostThankYouReward,
    );

    const message = `User Channel Post Thank You reward added ${newChannelPostThankYouReward.id}`;
    this.logger.log(message);
    this.eventEmitter.emit(
      RewardEvent.REWARD_ADDED,
      new RewardAddedEvent(newChannelPostThankYouReward),
    );
    return message;
  }

  async addChallengeWonReward(body: ChallengeWonEvent): Promise<string> {
    const {
      userChallenge: {
        user_id: userId,
        challenge_id: challengeId,
        hlp_points_earned_for_winning_the_challenge: points,
      },
    } = body;

    const userChallenge = await this.rewardsRepo.getChallengeById(challengeId);

    if (!userChallenge) {
      const message = `User Challenge Not found ${challengeId}`;
      return message;
    }

    const translations =
      this.translationService.getDataTranslations<ChallengeResponse>(
        [userChallenge],
        ['title'],
        ['reward.title.challenge_won'],
      );

    const challengeWondReward: ChallengeWonReward = {
      user_id: userId,
      challenge_id: userChallenge.id,
      hlp_reward_points_awarded: points,
      reward_type: RewardType.CHALLENGE_WON,
      title: translations.nl['title'],
      translations,
    };

    const newChallengeWonReward = await this.rewardsRepo.addReward(
      challengeWondReward,
    );

    if (!newChallengeWonReward) {
      const message = `failed to save User Challenge reward ${JSON.stringify(
        challengeWondReward,
      )}`;
      return message;
    }
    const message = `User User Challenge reward added ${newChallengeWonReward.id}`;
    this.eventEmitter.emit(
      RewardEvent.REWARD_ADDED,
      new RewardAddedEvent(newChallengeWonReward),
    );
    return message;
  }

  async addAdminPostReadReward(body: AdminPostRead): Promise<string> {
    const { admin_post_id, user_id } = body;
    const [adminPostRead] = await this.rewardsRepo.getAdminPostTitle(
      user_id,
      admin_post_id,
    );
    if (!adminPostRead) {
      const message = `Admin post read Not found ${admin_post_id}`;
      return message;
    }

    const [adminPostReadRewardExists] =
      await this.rewardsRepo.getAdminRewardsForPostRead(user_id, admin_post_id);
    if (adminPostReadRewardExists) {
      return `Admin post Read Reward Already Achieved ${JSON.stringify(
        adminPostReadRewardExists,
      )}`;
    }

    const adminPostReadReward: AdminPostReadReward = {
      user_id,
      channel_post_id: admin_post_id,
      hlp_reward_points_awarded: 1,
      reward_type: RewardType.ADMIN_CHANNEL_POST,
      title: `add post ${adminPostRead.title}`,
    };
    const newAdminPostReward = await this.rewardsRepo.addReward(
      adminPostReadReward,
    );
    if (!newAdminPostReward) {
      const message = `failed to save admin post read reward ${JSON.stringify(
        adminPostReadReward,
      )}`;
      return message;
    }
    const message = `Admin post Read ${newAdminPostReward.id}`;
    this.eventEmitter.emit(
      RewardEvent.REWARD_ADDED,
      new RewardAddedEvent(newAdminPostReward),
    );
    return message;
  }

  async addUserMoodCheckReward(body: UserMoodCheck): Promise<string> {
    const { category_id, user_id, id } = body;
    const userMoodCheck = await this.rewardsRepo.getUserMoodCheckTitle(
      category_id,
    );
    if (!userMoodCheck) {
      const message = `User mood check title Not found ${category_id}`;
      return message;
    }
    const [userMoodCheckRewardExists] =
      await this.rewardsRepo.getUserRewardsForMoodCheck(user_id, id);
    if (userMoodCheckRewardExists) {
      return `User mood check Reward Already Achieved ${JSON.stringify(
        userMoodCheckRewardExists,
      )}`;
    }

    const translations =
      this.translationService.getDataTranslations<MoodCheckCategory>(
        [userMoodCheck],
        ['title'],
        ['reward.title.mood_check_completed'],
      );

    const userMoodCheckReward: UserMoodCheckReward = {
      user_id,
      user_mood_check_id: id,
      hlp_reward_points_awarded: 5,
      reward_type: RewardType.MOOD_CHECK,
      title: translations.nl['title'],
      translations,
    };

    const newMoodCheckReward = await this.rewardsRepo.addReward(
      userMoodCheckReward,
    );
    if (!newMoodCheckReward) {
      const message = `failed to save user mood check reward ${JSON.stringify(
        userMoodCheckReward,
      )}`;
      return message;
    }
    const message = `User mood check ${newMoodCheckReward.id}`;
    this.eventEmitter.emit(
      RewardEvent.REWARD_ADDED,
      new RewardAddedEvent(newMoodCheckReward),
    );
    return message;
  }

  async getUserRewardHistory(userId: string): Promise<UserRewards[]> {
    return this.rewardsRepo.getUserRewardHistory(userId);
  }

  async addUserReward(body: UserFormAnswer): Promise<string> {
    const { id, form_id } = body;
    const userFormAnswersByid = await this.formsRepo.getFormById(id);

    if (!userFormAnswersByid) {
      throw new NotFoundException(' User Form Answer not found ');
    }

    const form = await this.formsRepo.getFormByFormId(form_id);

    const translations = this.translationService.getDataTranslations<Form>(
      [form],
      ['title'],
      ['reward.title.form_completed'],
    );

    const userReward: UserFormAnswerReward = {
      user_id: userFormAnswersByid.user_id,
      form_id: userFormAnswersByid.form_id,
      tool_kit_id: userFormAnswersByid.tool_kit_id,
      hlp_reward_points_awarded: userFormAnswersByid.hlp_points_earned,
      reward_type: RewardType.FORM,
      title: translations.nl['title'],
      translations,
    };

    const newuserFormReward = await this.rewardsRepo.addReward(userReward);
    this.eventEmitter.emit(
      RewardEvent.REWARD_ADDED,
      new RewardAddedEvent(newuserFormReward),
    );

    return `New user reward added ${newuserFormReward.id}`;
  }

  async addBlogToolKitReward(
    userId: string,
    toolKitId: string,
  ): Promise<CommonRespMessage> {
    const toolKit = await this.rewardsRepo.getToolKitById(toolKitId);
    if (!toolKit) {
      throw new NotFoundException(`rewards.toolkit_not_found`);
    }
    if (toolKit.tool_kit_type != ToolkitType.BLOG) {
      throw new BadRequestException(`rewards.not_blog_type_toolKit`);
    }

    const [translatedBlogToolkitEn] =
      this.translationService.getTranslations<Toolkit>(
        [toolKit],
        ['title'],
        'en',
      );

    const [translatedBlogToolkitNl] =
      this.translationService.getTranslations<Toolkit>(
        [toolKit],
        ['title'],
        'nl',
      );

    const trenslateTextEn = this.translationService.translate(
      `reward-content.tool_completed`,
      {},
      'en',
    );

    const trenslateTextNl = this.translationService.translate(
      `reward-content.tool_completed`,
      {},
      'nl',
    );

    const enTitle = `${translatedBlogToolkitEn.title} ${trenslateTextEn}`;
    const nlTitle = `${translatedBlogToolkitNl.title} ${trenslateTextNl}`;

    const translations = this.getRewardTranslations(enTitle, nlTitle);

    const toolKitReward: ToolKitReward = {
      user_id: userId,
      tool_kit_id: toolKit.id,
      hlp_reward_points_awarded: toolKit.tool_kit_hlp_reward_points,
      reward_type: RewardType.TOOL_KIT,
      title: nlTitle,
      translations,
    };
    const newToolKitReward = await this.rewardsRepo.addReward(toolKitReward);
    this.logger.log(toolKitReward);
    this.eventEmitter.emit(
      RewardEvent.REWARD_ADDED,
      new RewardAddedEvent(newToolKitReward),
    );
    return {
      message: this.translationService.translate(
        `rewards.reward_added_successfully`,
      ),
    };
  }

  async getChannel(channelId: string): Promise<Channel> {
    const channel = await this.rewardsRepo.getChannelById(channelId);
    if (!channel) {
      throw new NotFoundException(`Channel Not found ${channelId}`);
    }
    return channel;
  }
  async getUserById(userId: string): Promise<Users> {
    const user = await this.rewardsRepo.getUserById(userId);
    return user;
  }
}
