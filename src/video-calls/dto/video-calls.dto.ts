import { ChatType } from '@chats/entities/chat.entity';
import { UserRoles } from '@users/users.dto';

export class VideoCallNotificactionPayload {
  roomId: string;
  userName: string;
  initiatorUserId: string;
  receiverUserId: string;
  token: string;
  lastName?: string;
  firstName?: string;
  fullName?: string;
  url?: string;
  jitsiBaseUrl: string;
  roomSubject: string;
  videoCallType: ChatType;
  role?: UserRoles;
  email: string;
  avatar?: string;
  isVideoCall: boolean;
}
