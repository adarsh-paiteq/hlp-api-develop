import { Database } from '@core/modules/database/database.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CronScheduleService {
  private readonly logger = new Logger(CronScheduleService.name);
  constructor(private readonly database: Database) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteInvocationLogAndEventLog(): Promise<void> {
    try {
      this.logger.log('Called every day at MidNight');
      const deleteInvocationLogQuery = `DELETE FROM hdb_catalog.event_invocation_logs
        WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '24 hours'`;
      const deleteEventLogQuery = `DELETE FROM hdb_catalog.event_log
        WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '24 hours'`;

      await Promise.all([
        this.database.query<unknown>(deleteInvocationLogQuery, []),
        this.database.query<unknown>(deleteEventLogQuery, []),
      ]);
      this.logger.log('Invocation Log deleted successfully');
      this.logger.log('Event Log deleted successfully');
    } catch (error) {
      this.logger.error(error);
      throw new Error(error.message);
    }
  }
}
