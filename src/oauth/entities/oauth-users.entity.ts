import {
  Field,
  GraphQLISODateTime,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { Gender } from '@users/users.model';

@ObjectType()
export class OauthUser {
  id: string;
  email: string;
  organisation_id: string;
  organisation_patient_id?: string;
  organisation_allocation_code?: string;
  telephone_number?: string;
  epd_code?: EpdCode;
  display_name?: string;
  @Field(() => GraphQLISODateTime)
  birth_date?: string;
  gender?: Gender;
  client_id?: string;
  status: UserRegistrationStatus;
  activation_code: string;
  added_by: OauthUserAddedBy;
  is_deleted: boolean;
  @Field(() => GraphQLISODateTime)
  created_at: string;
  @Field(() => GraphQLISODateTime)
  updated_at: string;
}

export enum OauthUserAddedBy {
  ADMIN = 'ADMIN',
  OAUTH_API = 'OAUTH_API',
}

export enum EpdCode {
  MIJN_QUARANT_PG_ANTES = 'mijnQuarant_Antes',
  MIJN_QUARANT_PG = 'mijnQuarant_PG',
}

export enum UserRegistrationStatus {
  PENDING = 'PENDING',
  REGISTERED = 'REGISTERED',
  EXPIRED = 'EXPIRED',
}

registerEnumType(OauthUserAddedBy, { name: 'OauthUserAddedBy' });
registerEnumType(EpdCode, { name: 'EpdCode' });
registerEnumType(UserRegistrationStatus, { name: 'UserRegistrationStatus' });
