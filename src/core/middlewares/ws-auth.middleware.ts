import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { AuthService } from '@shared/auth/auth.service';
import { LoggedInUser } from '@shared/auth/jwt.strategy';
import { Socket } from 'socket.io';

export interface SocketClient extends Socket {
  user: LoggedInUser;
}

export type SocketMiddleware = (
  socket: Socket,
  next: (err?: Error) => void,
) => void;

export const WSAuthMiddleware = (
  authService: AuthService,
  configService: ConfigService,
  logger: Logger,
): SocketMiddleware => {
  return async (socket: SocketClient, next) => {
    try {
      const secret = configService.getOrThrow<string>('JWT_SECRET');
      const accessToken =
        socket.handshake.auth?.token || socket.handshake.headers?.token;
      const unauthorizedError = new WsException(`Unauthorized`);
      if (!accessToken) {
        logger.error(`Unauthorized User`);
        return next(unauthorizedError);
      }
      const { data: user, error } = await authService.verifyJwtToken(
        secret,
        accessToken,
      );
      if (error) {
        logger.error(`Unauthorized User`);
        return next(unauthorizedError);
      }

      const [isTokenBlocked, isUserDeleted] = await Promise.all([
        authService.isTokenBlocked(user.id),
        authService.isUserDeleted(user.id),
      ]);
      if (isUserDeleted && !isTokenBlocked && accessToken) {
        await authService.blockUserAccessToken(user.id, accessToken, user.exp);
        logger.warn(`User is deleted blocking token`);
      }
      if (isUserDeleted || isTokenBlocked) {
        logger.warn(`User is deleted or token blocked`);
        return next(unauthorizedError);
      }
      socket.user = user;
      next();
    } catch (error) {
      const exception = new WsException(error.message);
      next(exception);
    }
  };
};
