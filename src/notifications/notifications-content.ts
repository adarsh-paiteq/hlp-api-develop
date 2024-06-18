import { Injectable, NotFoundException } from '@nestjs/common';
import { Channel } from '../channels/entities/channel.entity';
import {
  ReminderNotificationData,
  toolkitBaseDeepLinks,
  TranslatedNotificationContent,
} from './notifications.model';
import { VideoCallNotificactionPayload } from '@video-calls/dto/video-calls.dto';
import { UserNotificationType } from './entities/user-notifications.entity';
import { TranslationService } from '@shared/services/translation/translation.service';
import { Translation } from '@utils/utils.dto';
import { NotificationContentsAndHeadings } from './dto/notifications.dto';
import { Challenge } from '@challenges/challenges.model';
import { Group } from '@groups/entities/groups.entity';
import { UserSchedule } from '@schedules/dto/get-dashboard.dto';

@Injectable()
export class NotificationsContent {
  constructor(private readonly translationService: TranslationService) {}

  preparePostLikeNotificationContent(
    userName: string,
    channel: Channel,
    post_id: string,
  ): TranslatedNotificationContent {
    const translations = this.translationService.getEnglishAndDutchTranslations(
      ['notification.title.post_like', 'notification.body.post_like'],
      { userName: userName },
    );
    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);
    const data = {
      page: `/community_tab_selected/0/channel_tab_from_community/0/${channel.title}/${channel.id}/post_reaction_from_channel_post?postId=${post_id}&channelId=${channel.id}`,
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  prepareFriendFollewedNotificationContent(
    userName: string,
    userId: string,
  ): TranslatedNotificationContent {
    const translations = this.translationService.getEnglishAndDutchTranslations(
      [
        'notification.title.friend_followed',
        'notification.body.friend_followed',
      ],
      {
        userName: userName,
      },
    );
    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);
    const data = {
      page: `/community_tab_selected/0/other_user_profile_from_community/${userName}/${userId}`,
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  prepareCheckInReminderNotificationContent(
    body: ReminderNotificationData,
  ): TranslatedNotificationContent {
    const checkinReminderNotificationData = { ...body };
    const translations =
      this.translationService.getDataTranslations<ReminderNotificationData>(
        [checkinReminderNotificationData],
        ['title'],
        [
          `notification.title.check_in_reminder`,
          `notification.body.check_in_reminder`,
        ],
      );
    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);
    const page = this.prepareReminderDeepLink(body);
    const data = {
      page,
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  prepareLateCheckInReminderNotificationContent(
    body: ReminderNotificationData,
  ): TranslatedNotificationContent {
    const translations = this.translationService.getEnglishAndDutchTranslations(
      [
        'notification.title.late_check_in_reminder',
        'notification.body.late_check_in_reminder',
      ],
    );
    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);
    const page = this.prepareReminderDeepLink(body);
    const data = {
      page,
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  prepareInactivityNotificationContent(): TranslatedNotificationContent {
    const translations = this.translationService.getEnglishAndDutchTranslations(
      ['notification.title.in_activity', 'notification.body.in_activity'],
    );
    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);
    const data = {
      page: '/dashboard',
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  prepareChallengeEndedNotificationContent(
    title: Challenge,
    challengeId: string,
  ): TranslatedNotificationContent {
    const challengeEndNotificationData = { ...title };
    const translations = this.translationService.getDataTranslations<Challenge>(
      [challengeEndNotificationData],
      ['title'],
      [
        `notification.title.challenge_ended`,
        `notification.body.challenge_ended`,
      ],
    );
    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);
    const data = {
      page: `/dashboard/challenge_ranking_from_dashboard/${challengeId}`,
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  prepareHlpDonatedNotificationContent(
    userName: string,
    hlpDonatedPoint: number,
    userId: string,
  ): TranslatedNotificationContent {
    const translations = this.translationService.getEnglishAndDutchTranslations(
      ['notification.title.hlp_donation', 'notification.body.hlp_donation'],
      { userName: userName, hlpDonatedPoint: hlpDonatedPoint },
    );
    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);
    const data = {
      page: `/community_tab_selected/0/other_user_profile_from_community/${userName}/${userId}`,
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  prepareBonusAvailableNotificationContent(): TranslatedNotificationContent {
    const translations = this.translationService.getEnglishAndDutchTranslations(
      [
        'notification.title.bonus_available',
        'notification.body.bonus_available',
      ],
    );
    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);

    const data = {
      page: '/score_tab_selected/0/bonuses_from_score',
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  preparePostReactionNotificationContent(
    userName: string,
    postTitle: string,
    channel: Channel,
    postId: string,
  ): TranslatedNotificationContent {
    const translations = this.translationService.getEnglishAndDutchTranslations(
      ['notification.title.post_reaction', 'notification.body.post_reaction'],
      { userName: userName, postTitle: postTitle },
    );
    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);
    const data = {
      page: `/community_tab_selected/0/channel_tab_from_community/0/${channel.title}/${channel.id}/post_reaction_from_channel_post?postId=${postId}&channelId=${channel.id}`,
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  preparePostReactionDoctorNotificationContent(
    userName: string,
    channel: Channel,
  ): TranslatedNotificationContent {
    const postReactionNotificationData = { ...channel, userName };
    const translations = this.translationService.getDataTranslations<Channel>(
      [postReactionNotificationData],
      ['title'],
      [
        `notification.title.doctor_post_reaction`,
        `notification.body.doctor_post_reaction`,
      ],
    );

    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);
    const data = {
      page: `/`,
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  preparePostThankYouNotificationContent(
    userName: string,
    postTitle: string,
    hlpDonatedPoint: number,
    channel: Channel,
    postId: string,
  ): TranslatedNotificationContent {
    const translations = this.translationService.getEnglishAndDutchTranslations(
      ['notification.title.post_thankyou', 'notification.body.post_thankyou'],
      {
        userName: userName,
        hlpDonatedPoint: hlpDonatedPoint,
        postTitle: postTitle,
      },
    );
    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);
    const data = {
      page: `/community_tab_selected/0/channel_tab_from_community/0/${channel.title}/${channel.id}/post_reaction_from_channel_post?postId=${postId}&channelId=${channel.id}`,
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  prepareReminderDeepLink(body: ReminderNotificationData): string {
    const {
      scheduleId,
      sessionDate,
      toolkitCategoryId,
      toolkitId,
      toolkitType,
      challengeId,
      goalId,
      title,
      isUserJoinedChallenge,
      dayId,
      day,
    } = body;

    const basePage = toolkitBaseDeepLinks.get(toolkitType);

    if (!basePage) {
      throw new NotFoundException('base deep link not found');
    }
    let page = basePage
      .replace('replaceToolkitId', toolkitId)
      .replace('replaceCategoryId', toolkitCategoryId)
      .replace('replaceScheduleId', scheduleId)
      .replace('replaceSessionDate', sessionDate)
      .replace('replaceTitle', title);
    if (challengeId) {
      page = page.concat(`&challengeId=${challengeId}`);
    }
    if (dayId) {
      page = page.concat(`&dayId=${dayId}`);
    }
    if (day) {
      page = page.concat(`&day=${day}`);
    }

    if (goalId) {
      page = page.concat(`&goalId=${goalId}`);
    }

    if (isUserJoinedChallenge) {
      page = page.replace('from=plan', 'from=challenge');
    }
    return page;
  }

  prepareAgendaReminderNotificationContent(
    body: ReminderNotificationData,
    reminder_time: string,
  ): TranslatedNotificationContent {
    const reminderNotificationData = { ...body, reminder_time };
    const translations =
      this.translationService.getDataTranslations<ReminderNotificationData>(
        [reminderNotificationData],
        ['title'],
        [
          `notification.title.agenda_reminder`,
          `notification.body.agenda_reminder`,
        ],
      );
    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);
    const page = this.prepareReminderDeepLink(body);
    const data = {
      page,
      reminder_time,
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  prepareVideoCallNotificationContent(
    payload: VideoCallNotificactionPayload,
  ): TranslatedNotificationContent {
    const userName = payload.userName;
    const translations = this.translationService.getEnglishAndDutchTranslations(
      ['notification.title.video_call', 'notification.body.video_call'],
      { userName: userName },
    );

    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);
    //TODO: Add a deeplink
    const data = {
      ...payload,
      page: `/dashboard`,
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  prepareGroupInvitationNotificationContent(
    groupName: string,
    invitationId: string,
    type: UserNotificationType,
  ): TranslatedNotificationContent {
    const translations = this.translationService.getEnglishAndDutchTranslations(
      [
        'notification.title.group_invitation',
        'notification.body.group_invitation',
      ],
      { groupName: groupName },
    );

    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);
    const data = {
      page: `/dashboard`,
      invitationId,
      type,
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  prepareGroupMemberAddedNotificationContent(
    group: Group,
    channel_id: string,
  ): TranslatedNotificationContent {
    const translations = this.translationService.getDataTranslations<Group>(
      [group],
      ['title'],
      [
        `notification.title.group_member_added`,
        `notification.body.group_member_added`,
      ],
    );
    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);
    const data = {
      page: `/community_tab_selected/0/channel_tab_from_community/0/${group.title}/${channel_id}`,
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  prepareFriendRequestNotificationContent(
    userName: string,
    type: UserNotificationType,
  ): TranslatedNotificationContent {
    const translations = this.translationService.getEnglishAndDutchTranslations(
      ['notification.title.friend_request', 'notification.body.friend_request'],
      { title: userName },
    );

    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);
    const data = {
      page: `/`,
      type,
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  prepareCoachAddedNotificationContent(
    patientName: string,
    coachName: string,
  ): TranslatedNotificationContent {
    const translations = this.translationService.getEnglishAndDutchTranslations(
      ['notification.title.coach_added', 'notification.body.coach_added'],
      { patientName: patientName, coachName: coachName },
    );

    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);

    const data = {
      page: `/`,
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  prepareCoachGroupNotificationContent(
    groupName: string,
    coachName: string,
  ): TranslatedNotificationContent {
    const translations = this.translationService.getEnglishAndDutchTranslations(
      [
        'notification.title.coach_added_group',
        'notification.body.coach_added_group',
      ],
      { groupName: groupName, coachName: coachName },
    );

    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);

    const data = {
      page: `/`,
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  preparePostLikedDoctorNotificationContent(
    postLiker: string,
    channel: Channel,
  ): TranslatedNotificationContent {
    const postLikeNotificationData = { ...channel, postLiker };

    const translations = this.translationService.getDataTranslations<Channel>(
      [postLikeNotificationData],
      ['title'],
      [
        `notification.title.doctor_post_like`,
        `notification.body.doctor_post_like`,
      ],
    );
    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);

    const data = {
      page: `/`,
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  prepareTreatmentAddedNotificationContent(
    treatmentType: string,
    coachName: string,
  ): TranslatedNotificationContent {
    const translations = this.translationService.getEnglishAndDutchTranslations(
      [
        'notification.title.treatment_added',
        'notification.body.treatment_added',
      ],
      { title: treatmentType, coach: coachName },
    );
    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);
    const data = {
      page: `/dashboard/timeline_tab_from_dashboard/0`,
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  prepareTimelineNoteAddedNotificationContent(
    coachName: string,
  ): TranslatedNotificationContent {
    const translations = this.translationService.getEnglishAndDutchTranslations(
      [
        'notification.title.treatment_timeline_note_added',
        'notification.body.treatment_timeline_note_added',
      ],
      { title: coachName },
    );
    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);
    const data = {
      page: `/dashboard/timeline_tab_from_dashboard/0`,
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  prepareUserRegisteredNotificationContent(
    patientName: string,
  ): TranslatedNotificationContent {
    const translations = this.translationService.getEnglishAndDutchTranslations(
      [
        'notification.title.patient_registered',
        'notification.body.patient_registered',
      ],
      { patientName: patientName },
    );
    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);
    // TODO: add page link which redirect to the treatment timeline of this patient
    const data = {
      page: `/`,
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  prepareAppointmentScheduleAddedNotificationContent(
    doctorName: string,
    appointmentDate: string | Date,
    scheduleId: string,
    is_completed: boolean,
  ): TranslatedNotificationContent {
    const translations = this.translationService.getEnglishAndDutchTranslations(
      [
        'notification.title.appointment_scheduled_date',
        'notification.body.appointment_scheduled_date',
      ],
      { appointmentDate: appointmentDate, doctorName: doctorName },
    );
    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);
    const data = {
      page: `/appointment_tab?from=plan&scheduleId=${scheduleId}&date=${appointmentDate}&isCompleted=${is_completed}`,
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  prepareTimelineFileAddedNotificationContent(
    coachName: string,
  ): TranslatedNotificationContent {
    const translations = this.translationService.getEnglishAndDutchTranslations(
      [
        'notification.title.treatment_timeline_file_added',
        'notification.body.treatment_timeline_file_added',
      ],
      { title: coachName },
    );
    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);
    const data = {
      page: `/dashboard/timeline_tab_from_dashboard/0`,
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  prepareActivityScheduleAddedNotificationContent(
    doctorName: string,
    activityName: string,
  ): TranslatedNotificationContent {
    const translations = this.translationService.getEnglishAndDutchTranslations(
      [
        'notification.title.appointment_scheduled',
        'notification.body.appointment_scheduled',
      ],
      {
        activityName: activityName,
        doctorName: doctorName,
      },
    );
    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);
    const data = {
      page: `/dashboard/timeline_tab_from_dashboard/0`,
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  prepareAppointmentReminderNotificationContent(
    appointmentName: string,
    appointmentDate: string | Date,
    scheduleId: string,
    is_completed: boolean,
  ): TranslatedNotificationContent {
    const translations = this.translationService.getEnglishAndDutchTranslations(
      [
        'notification.title.user_appointment_reminder',
        'notification.body.user_appointment_reminder',
      ],
      { appointmentName: appointmentName },
    );
    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);
    const data = {
      page: `/appointment_tab?from=plan&scheduleId=${scheduleId}&date=${appointmentDate}&isCompleted=${is_completed}`,
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  prepareTreatmentClosedNotificationContent(
    name: string,
    Treatment_title: string,
  ): TranslatedNotificationContent {
    const translations = this.translationService.getEnglishAndDutchTranslations(
      [
        'notification.title.treatment_closed',
        'notification.body.treatment_closed',
      ],
      { name: name, Treatment_title: Treatment_title },
    );
    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);
    //TODO: add deeplink.
    const data = {
      page: `/dashboard`,
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  prepareToolkitPerformedNotificationContent(
    patientName: string,
    agenda: UserSchedule,
  ): Translation {
    const translations = this.translationService.getEnglishAndDutchTranslations(
      [
        'notification.title.toolkit_form_performed',
        'notification.body.toolkit_form_performed',
      ],
      { patientName: patientName, toolkitTitle: agenda.toolkit_title },
    );

    return translations;
  }

  prepareAfterCareNotificationToTreatmentOwner(): TranslatedNotificationContent {
    const translations = this.translationService.getEnglishAndDutchTranslations(
      [
        'notification.title.start_after_care_treatment',
        'notification.body.start_after_care_treatment',
      ],
    );
    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);
    //TODO: add deeplink.
    const data = {
      page: `/dashboard`,
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  getNotificationHeadingsAndContents(
    translations: Translation,
  ): NotificationContentsAndHeadings {
    const headings = {
      en: translations.en['title'],
      nl: translations.nl['title'],
    };
    const contents = {
      en: translations.en['body'],
      nl: translations.nl['body'],
    };

    return { headings, contents };
  }

  prepareToolkitTimelineMessageAddedNotificationContent(): TranslatedNotificationContent {
    const translations = this.translationService.getEnglishAndDutchTranslations(
      [
        'notification.title.timeline_message_added',
        'notification.body.timeline_message_added',
      ],
    );
    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);

    const data = {
      page: '/dashboard/timeline_tab_from_dashboard/0',
    };
    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }

  prepareUserToolkitReminderNotificationContent(
    title: string,
    reminder_time: string,
  ): TranslatedNotificationContent {
    const translations = this.translationService.getEnglishAndDutchTranslations(
      [
        `notification.title.agenda_reminder`,
        `notification.body.agenda_reminder`,
      ],
      { title: title },
    );
    const headingsAndContents =
      this.getNotificationHeadingsAndContents(translations);

    const page = `/dashboard`;
    const data = {
      page,
      reminder_time,
    };

    return {
      ...headingsAndContents,
      translations,
      data,
    };
  }
}
