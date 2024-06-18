import { OauthUser } from './entities/oauth-users.entity';

export enum OauthEvent {
  OAUTH_USER_ADDED = '[OAUTH] OAUTH USER ADDED',
}

export class OauthUserAddedEvent {
  constructor(public oauthUser: OauthUser) {}
}
