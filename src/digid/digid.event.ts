export enum DigidEvent {
  DIGID_SESSION_LOG_ADDED = '[DIGID] DIGID_SESSION_LOG_ADDED',
}

export class DigidSessionLogAddedEvent {
  constructor(public userId: string) {}
}
