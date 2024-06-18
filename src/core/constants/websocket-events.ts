export const WEBSOCKET_SERVER_EVENT = {
  CHATS_JOIN: 'chats/join',
  CHATS_MESSAGES: 'chats/messages',
} as const;

export const WEBSOCKET_CLIENT_EVENT = {
  CHATS_JOIN_ACK: (userId: string) => `users/${userId}/join/ack`,
  CHATS_MESSAGE: (chatId: string) => `chats/${chatId}/message`,
  USERS_CHAT_UPDATES: (userId: string) => `users/${userId}/chat/updates`,
  USERS_STATUS_UPDATES: (userId: string) => `users/${userId}/status/updates`,
  DOCTORS_NOTIFICATIONS_ALERT: (doctorId: string) =>
    `doctors/${doctorId}/notificatons/alert`,
  USERS_DIGID_LOGIN_UPDATES: (userId: string) =>
    `users/${userId}/digid/login/updates`,
} as const;

export type ObjectValue<T> = T[keyof T];

export type WebsocketServerEvent = ObjectValue<typeof WEBSOCKET_SERVER_EVENT>;
export type WebsocketClientEvent = ObjectValue<typeof WEBSOCKET_CLIENT_EVENT>;
