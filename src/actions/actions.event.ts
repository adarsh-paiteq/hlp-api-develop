import { UserAction } from './actions.dto';

export enum ActionsEvent {
  ACTION_CLAIMED = '[ACTIONS] CLAIMED',
}

export class ActionClaimedEvent {
  constructor(public userAction: UserAction) {}
}
