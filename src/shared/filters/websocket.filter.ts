import {
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { TranslationService } from '@shared/services/translation/translation.service';
import { PacketType } from 'socket.io-parser';
import { ErrorResponse } from './all.filter';
import { ErrorReportService } from '@core/services/error-report/error-report.service';
@Catch()
export class WebsocketExceptionsFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(WebsocketExceptionsFilter.name);
  constructor(
    private readonly translationService: TranslationService,
    private readonly errorReportService: ErrorReportService,
  ) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
  catch(exception: any, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    const lng = this.getLng(host);
    this.logger.error(exception['stack']);
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const isResponseObject = typeof response === 'object';
      const status = exception.getStatus();
      let newResponse = {};
      const { key, args } = this.getMessage(response);
      if (isResponseObject) {
        newResponse = {
          ...response,
          message: this.translationService.translate(key, args, lng),
          status,
        };
      }
      if (!this.translationService.isExists(key)) {
        this.logger.warn(`missing key ${key}`);
      }

      client.packet({
        type: PacketType.ACK,
        data: [{ errors: [newResponse] }],
        id: client.nsp._ids++,
      });
    }

    const { key, args } = this.getMessage(exception);
    const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    const message = this.translationService.translate(key, args, lng);
    const errorResponse: ErrorResponse = {
      statusCode,
      message,
    };

    if (
      errorResponse.statusCode === HttpStatus.INTERNAL_SERVER_ERROR ||
      errorResponse.statusCode === HttpStatus.UNAUTHORIZED
    ) {
      this.errorReportService.report(exception);
    }

    client.packet({
      type: PacketType.ACK,
      data: [{ errors: [errorResponse] }],
      id: client.nsp._ids++,
    });
  }

  public getMessage(response: string | object): {
    key: string;
    args: Record<string, unknown>;
  } {
    let key = 'shared.server_error';
    let args: Record<string, string | number | boolean> = {};
    const isResponseObject = typeof response === 'object';
    if (isResponseObject) {
      const res: Record<string, unknown> = { ...response };
      const { message } = res;
      if (typeof message === 'string') {
        const [raw, payload] = message.split('|');
        try {
          args = payload ? JSON.parse(payload) : {};
          key = raw;
        } catch (error) {
          this.logger.warn(error);
        }
      }
    }
    return { key, args };
  }

  getLng(host: ArgumentsHost): string {
    const request = host.switchToHttp().getRequest();
    return request.language;
  }
}
