import { Plugin } from '@nestjs/apollo';
import { Logger } from '@nestjs/common';
import * as opentelemetry from '@opentelemetry/api';
import {
  ApolloServerPlugin,
  GraphQLRequestListener,
  GraphQLRequestContext,
} from 'apollo-server-plugin-base';
import { ClsService } from 'nestjs-cls';
import { ErrorReportService } from '../services/error-report/error-report.service';

@Plugin()
export class LoggingPlugin implements ApolloServerPlugin {
  private readonly logger = new Logger(LoggingPlugin.name);
  constructor(
    private readonly cls: ClsService,
    private readonly errorReportService: ErrorReportService,
  ) {}
  async requestDidStart(
    context: GraphQLRequestContext,
  ): Promise<GraphQLRequestListener> {
    const { request } = context;
    this.logger.log(`{"query":${JSON.stringify(request.query)}}`);
    return {
      willSendResponse: async (): Promise<void> => {
        const errorLog: { errors: string; traceId?: string } = {
          errors: JSON.stringify(context.errors),
        };
        if (context.errors) {
          // get tracedId to include in error
          const span = opentelemetry.trace.getSpan(
            opentelemetry.context.active(),
          );
          if (span) {
            const { traceId } = span.spanContext();
            const traceIdEnd = traceId.slice(traceId.length / 2);
            errorLog['traceId'] = BigInt(`0x${traceIdEnd}`).toString();
          }
          this.logger.error(`${JSON.stringify(errorLog)}`);
          this.errorReportService.report(new Error(JSON.stringify(errorLog)));
        }
      },
    };
  }
}
