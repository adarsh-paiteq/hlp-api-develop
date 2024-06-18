import { HttpStatus } from '@nestjs/common';
import { CommonResponseMessage } from '@users/dto/users.dto';

export interface PingResponse {
  health_status: string;
}

export enum MailchimpListMemberStatus {
  SUBSCRIBED = 'subscribed',
  UNSUBSCRIBED = 'unsubscribed',
  CLEANED = 'cleaned',
  PENDING = 'pending',
  TRANSACTIONAL = 'transactional',
}

export class MailchimpListMemberBody {
  email_address: string;
  status: MailchimpListMemberStatus;
  merge_fields: Mergefields;
}

interface Mergefields {
  FNAME: string;
  LNAME: string;
  ACCGROUP: string;
  GENDER: string;
  ROLE: string;
  PACKAGE: string;
  ORG: string;
}

export interface MailchimpListMemberSuccessResponse {
  id: string;
  email_address: string;
  unique_email_id: string;
  contact_id: string;
  full_name: string;
  web_id: number;
  email_type: string;
  status: string;
  unsubscribe_reason: string;
  consents_to_one_to_one_messaging: boolean;
  merge_fields: Mergefields;
  interests: Record<string, unknown>;
  stats: MemberStats;
  ip_signup: string;
  timestamp_signup: string;
  ip_opt: string;
  timestamp_opt: string;
  member_rating: string;
  last_changed: string;
  language: string;
  vip: boolean;
  email_client: string;
  location: FullMemberLocation;
  marketing_permissions: MemberMarketingPermissions[];
  last_note: MemberLastNote;
  source: string;
  tags_count: number;
  tags: Tags[];
  list_id: string;
  _links: Link[];
}

interface MemberStats {
  avg_open_rate: number;
  avg_click_rate: number;
  ecommerce_data: MemberEcommerceData;
}

interface MemberEcommerceData {
  total_revenue: number;
  number_of_orders: number;
  currency_code: number;
}

interface MemberLocation {
  latitude: number;
  logitude: number;
}

interface FullMemberLocation extends MemberLocation {
  gmtoff: number;
  dstoff: number;
  country_code: string;
  timezone: string;
  region: string;
}

interface MemberMarketingPermissions extends MemberMarketingPermissionsInput {
  text: string;
}

interface MemberMarketingPermissionsInput {
  marketing_permission_id: string;
  enabled: boolean;
}

interface MemberLastNote {
  note_id: number;
  created_at: string;
  created_by: string;
  note: string;
}

interface Tags {
  id: number;
  name: string;
}

export interface Link {
  rel: string;
  href: string;
  method: HttpMethod;
  targetSchema: string;
  schema: string;
}

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD';

export interface MailchimpListMemberErrorResponse {
  type: string;
  title: string;
  status: HttpStatus;
  detail: string;
  instance: string;
}

export type AddOrUpdateUserToMailchimpListResponse =
  | MailchimpListMemberSuccessResponse
  | MailchimpListMemberErrorResponse
  | CommonResponseMessage;
