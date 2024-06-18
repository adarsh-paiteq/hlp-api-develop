import { Checkin } from '../checkins/entities/check-ins.entity';
import { Toolkit, ToolkitType } from '../toolkits/toolkits.model';
import { ScheduleReminder } from '../schedules/schedules.dto';
import { IsNotEmpty, IsString } from 'class-validator';
import * as OneSignal from '@onesignal/node-onesignal';
import { Translation } from '@utils/utils.dto';

export class EngagementNotification {
  date: string;
  body: string;
  title: string;
  type: string;
  created_at: string;
  updated_at: string;
  id: string;
}

export interface CheckInReminderData {
  scheduleReminder: ScheduleReminder;
  checkIn: Checkin;
}

export interface AgendaReminderData {
  scheduleReminder: ScheduleReminder;
  agenda: Toolkit;
}

export type NotificationData = {
  page?: string;
};

export interface NotificationContent {
  headings: string;
  contents: string;
  data: NotificationData;
}

export interface TranslatedNotificationContent {
  headings: OneSignal.StringMap;
  contents: OneSignal.StringMap;
  translations: Translation;
  data: NotificationData;
}

export class GenerateAuthHash {
  @IsString()
  data: string;
}

export interface ReminderNotificationData {
  title: string;
  toolkitType: ToolkitType;
  toolkitId: string;
  toolkitCategoryId: string;
  scheduleId: string;
  challengeId?: string;
  isUserJoinedChallenge?: boolean;
  goalId?: string;
  sessionDate: string;
  day?: number;
  dayId?: string;
  translations?: Translation;
}

export const toolkitBaseDeepLinks = new Map<ToolkitType, string>([
  [
    ToolkitType.BLOOD_PRESSURE,
    `/dashboard/blood_pressure_tab_subroute_from_dashboard?toolKitId=replaceToolkitId&categoryId=replaceCategoryId&from=plan&toolKitType=BLOOD_PRESSURE&scheduleId=replaceScheduleId&sessionDate=replaceSessionDate`,
  ],
  [
    ToolkitType.ALCOHOL_INTAKE,
    `/dashboard/alcohol_tab_subroute_from_dashbaord?toolKitId=replaceToolkitId&categoryId=replaceCategoryId&from=plan&toolKitType=ALCOHOL_INTAKE&scheduleId=replaceScheduleId&sessionDate=replaceSessionDate`,
  ],
  [
    ToolkitType.WEIGHT,
    `/dashboard/weight_tab_subroute_from_dashboard?toolKitId=replaceToolkitId&categoryId=replaceCategoryId&from=plan&toolKitType=WEIGHT&scheduleId=replaceScheduleId&sessionDate=replaceSessionDate`,
  ],
  [
    ToolkitType.ECG,
    `/dashboard/heart_ecg_tab_subroute_from_dashboard?toolKitId=replaceToolkitId&categoryId=replaceCategoryId&from=plan&toolKitType=ECG&scheduleId=replaceScheduleId&sessionDate=replaceSessionDate`,
  ],
  [
    ToolkitType.HEART_RATE,
    `/dashboard/heart_rate_tab_subroute_from_dashboard?toolKitId=replaceToolkitId&categoryId=replaceCategoryId&from=plan&toolKitType=HEART_RATE&scheduleId=replaceScheduleId&sessionDate=replaceSessionDate`,
  ],
  [
    ToolkitType.MEDICATION,
    `/dashboard/medication_tab_subroute_from_dashboard?toolKitId=replaceToolkitId&categoryId=replaceCategoryId&from=plan&toolKitType=MEDICATION&scheduleId=replaceScheduleId&sessionDate=replaceSessionDate`,
  ],
  [
    ToolkitType.MEDITATION,
    `/dashboard/meditation_tab_subroute_from_dashboard?toolKitId=replaceToolkitId&categoryId=replaceCategoryId&from=plan&toolKitType=MEDITATION&scheduleId=replaceScheduleId&sessionDate=replaceSessionDate`,
  ],
  [
    ToolkitType.PODCAST,
    `/dashboard/podcast_tab_subroute_from_dashboard?toolKitId=replaceToolkitId&categoryId=replaceCategoryId&from=plan&toolKitType=PODCAST&scheduleId=replaceScheduleId&sessionDate=replaceSessionDate`,
  ],
  [
    ToolkitType.FORM,
    `/dashboard/repeated_forms_tab_subroute_from_dashboard?id=replaceToolkitId&from=plan&scheduleId=replaceScheduleId&sessionDate=replaceSessionDate`,
  ],
  [
    ToolkitType.RUNNING,
    `/dashboard/running_tab_subroute_from_dashboard?toolKitId=replaceToolkitId&categoryId=replaceCategoryId&from=plan&toolKitType=RUNNING&scheduleId=replaceScheduleId&sessionDate=replaceSessionDate`,
  ],
  [
    ToolkitType.VIDEO,
    `/dashboard/video_tab_subroute_from_dashboard?toolKitId=replaceToolkitId&categoryId=replaceCategoryId&from=plan&toolKitType=VIDEO&scheduleId=replaceScheduleId&sessionDate=replaceSessionDate`,
  ],
  [
    ToolkitType.STEPS,
    `/dashboard/steps_tab_subroute_from_dashboard?toolKitId=replaceToolkitId&categoryId=replaceCategoryId&from=plan&toolKitType=STEPS&scheduleId=replaceScheduleId&sessionDate=replaceSessionDate`,
  ],
  [
    ToolkitType.SPORT,
    `/dashboard/sport_tab_subroute_from_dashboard?toolKitId=replaceToolkitId&categoryId=replaceCategoryId&from=plan&toolKitType=SPORT&scheduleId=replaceScheduleId&sessionDate=replaceSessionDate`,
  ],
  [
    ToolkitType.SLEEP_CHECK,
    `/dashboard/sleep_tab_subroute_from_dashboard?toolKitId=replaceToolkitId&categoryId=replaceCategoryId&from=plan&toolKitType=SLEEP_CHECK&scheduleId=replaceScheduleId&sessionDate=replaceSessionDate`,
  ],
  [
    ToolkitType.HABIT,
    `/dashboard/?toolKitId=replaceToolkitId&categoryId=replaceCategoryId&from=plan&scheduleId=replaceScheduleId&sessionDate=replaceSessionDate`,
  ],
  [
    ToolkitType.EPISODES,
    `/dashboard/episode_from_dashboard?toolKitId=replaceToolkitId&categoryId=replaceCategoryId&from=plan&scheduleId=replaceScheduleId&sessionDate=replaceSessionDate&formTitle=replaceTitle`,
  ],
  [
    ToolkitType.ACTIVITY,
    `/dashboard/activity_tab_from_dashbaord?toolKitId=replaceToolkitId&categoryId=replaceCategoryId&from=plan&toolKitType=ACTIVITY&scheduleId=replaceScheduleId&sessionDate=replaceSessionDate`,
  ],
  [
    ToolkitType.BLOG,
    `/dashboard/blog_tab_subroute_from_dashboard?toolKitId=replaceToolkitId&categoryId=replaceCategoryId&toolKitType=BLOG&from=do_it_now`,
  ],
  [
    ToolkitType.DRINK_WATER,
    `/dashboard/running_tab_subroute_from_dashboard?toolKitId=replaceToolkitId&categoryId=replaceCategoryId&from=plan&toolKitType=DRINK_WATER&scheduleId=replaceScheduleId&sessionDate=replaceSessionDate`,
  ],
  [
    ToolkitType.AUDIO,
    `/dashboard/audio_tab_subroute_from_dashboard?toolKitId=replaceToolkitId&categoryId=replaceCategoryId&from=plan&formTitle=replaceTitle&scheduleId=replaceScheduleId`,
  ],
  [
    ToolkitType.VITALS,
    `/dashboard/vital_tab_subroute_from_dashboard?toolKitId=replaceToolkitId&categoryId=replaceCategoryId&from=plan&toolKitType=VITALS&scheduleId=replaceScheduleId`,
  ],
  [
    ToolkitType.MOOD,
    `/dashboard/mood_tab_subroute_from_dashboard?toolKitId=replaceToolkitId&categoryId=replaceCategoryId&from=plan&toolKitType=MOOD&scheduleId=replaceScheduleId&title=replaceTitle`,
  ],
  [ToolkitType.SYMPTOMS_LOG, `/dashboard`],
  [ToolkitType.ADDICTION_LOG, `/dashboard`],
  [ToolkitType.EMOTION_SYMPTOMS_LOG, `/dashboard`],
  [ToolkitType.FORCED_ACTION_SYMPTOMS_LOG, `/dashboard`],
  [ToolkitType.ANXIETY_SYMPTOMS_LOG, `/dashboard`],
  [ToolkitType.SUSPICIUS_SYMPTOMS_LOG, `/dashboard`],
  [ToolkitType.HYPER_ACTIVITY_SYMPTOMS_LOG, `/dashboard`],
]);

export class GetAndroidNotificationChannel {
  @IsNotEmpty()
  @IsString()
  reminderTone: string;
}
