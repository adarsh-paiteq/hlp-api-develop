/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import { GraphQLResponse } from 'graphql-request/dist/types';
import { ErrorReportService } from '@core/services/error-report/error-report.service';
import { TranslationService } from '../services/translation/translation.service';
import { GqlArgumentsHost, GqlContextType } from '@nestjs/graphql';

interface CustomValidationError {
  property: string;
  constraints: string[];
}

interface HasuraError {
  code: string;
  [key: string]: string;
}

export interface ErrorResponse {
  statusCode: number;
  message?: string | undefined;
  errors?: string[] | CustomValidationError[];
  extensions?: HasuraError;
}

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  constructor(
    readonly httpAdapterHost: HttpAdapterHost,
    private readonly errorReportService: ErrorReportService,
    private readonly translationService: TranslationService,
  ) {
    super();
  }

  getMessage(response: string | object): {
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
    const contextType = host.getType<GqlContextType>();
    if (contextType === 'graphql') {
      const gqlHost = GqlArgumentsHost.create(host);
      const context = gqlHost.getContext();
      return context.req.language;
    }
    const request = host.switchToHttp().getRequest();
    return request.language;
  }

  catch(exception: any, host: ArgumentsHost): any {
    this.logger.error(exception.stack);
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const lng = this.getLng(host);
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
      return ctx.getResponse()?.status
        ? httpAdapter.reply(ctx.getResponse(), newResponse, status)
        : new HttpException(newResponse, status);
    }

    const { key, args } = this.getMessage(exception);
    const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    const message = this.translationService.translate(key, args, lng);
    const errorResponse: ErrorResponse = {
      statusCode,
      message: exception.message || message,
    };

    // handle graphql response
    if (exception['response']) {
      const graphQLResponse: GraphQLResponse = exception['response'];
      if (graphQLResponse.status !== HttpStatus.OK) {
        errorResponse.statusCode = graphQLResponse.status;
      }
      const { errors } = graphQLResponse;
      if (errors?.length) {
        const [error] = errors;
        errorResponse['message'] = error['message'];
      }
      if (graphQLResponse['error']) {
        errorResponse.message = graphQLResponse['error'] as string;
      }
    }
    if (
      errorResponse.statusCode === HttpStatus.INTERNAL_SERVER_ERROR ||
      errorResponse.statusCode === HttpStatus.UNAUTHORIZED
    ) {
      this.errorReportService.report(exception);
    }
    return ctx.getResponse()?.status
      ? httpAdapter.reply(
          ctx.getResponse(),
          errorResponse,
          errorResponse.statusCode,
        )
      : new HttpException(errorResponse, errorResponse.statusCode);
  }
}
