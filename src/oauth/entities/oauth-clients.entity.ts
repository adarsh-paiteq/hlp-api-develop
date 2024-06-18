export class OauthClient {
  id: string;
  client_id: string;
  client_secret: string;
  organization_id: string;
  is_disabled: boolean;
  grants: string[];
  refresh_token?: string;
  created_at: Date;
  updated_at: Date;
}
