import { UserFormAnswer } from './entities/user-form-answer.entity';

export const enum FormsEvent {
  USER_FORM_ANSWER_ADDED = 'USER_FORM_ANSWER_ADDED',
}

export class UserFormAnswerEvent {
  constructor(public userFormAnswer: UserFormAnswer) {}
}
