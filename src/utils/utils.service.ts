import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  SortOrder,
  ToolkitTarget,
  ToolkitTargetType,
  ToolkitTargets,
} from './utils.dto';
import * as datefns from 'date-fns';
import { Schedule } from '../schedules/schedules.dto';
import { DateTime } from 'luxon';
import { ScheduleType } from '../schedules/entities/schedule.entity';
import { TranslationService } from '@shared/services/translation/translation.service';
import { customAlphabet } from 'nanoid';
import { EnvVariable, Environment } from '@core/configs/config';
import { ConfigService } from '@nestjs/config';
import { launch } from 'puppeteer';
import stream from 'stream';

@Injectable()
export class UtilsService {
  private logger = new Logger(UtilsService.name);
  constructor(
    private readonly translationService: TranslationService,
    private readonly configService: ConfigService,
  ) {}
  getTarget(schedule: Schedule, date: string): ToolkitTarget {
    const repeatPerDay =
      schedule.repeat_per_day && schedule.repeat_per_day > 1
        ? schedule.repeat_per_day
        : 1;

    // target
    const scheduleType = schedule.schedule_type;
    let targetType: ToolkitTargetType;

    if (ToolkitTargets.has(scheduleType)) {
      targetType = ToolkitTargets.get(scheduleType) as ToolkitTargetType;
    } else {
      const translatedType = this.translationService.translate(
        `toolkits.daily_toolkit_type`,
      );
      targetType = translatedType as ToolkitTargetType;
    }
    // total,completed
    let scheduleDays = 1; // default one time
    if (
      scheduleType === ScheduleType.WEEKLY &&
      schedule.schedule_days?.length
    ) {
      scheduleDays = schedule.schedule_days.length;
    }
    if (
      scheduleType === ScheduleType.MONTHLY &&
      schedule.repeat_per_month?.length
    ) {
      scheduleDays = schedule.repeat_per_month.length;
    }
    if (scheduleType === ScheduleType.DAILY) {
      // 7 days per week
      scheduleDays = 7;
    }
    const sessions = schedule.user_schedule_sessions.filter((session) => {
      if (scheduleType === ScheduleType.ONE_TIME) {
        return datefns.isSameDay(
          new Date(date),
          new Date(session.session_date),
        );
      }
      if (scheduleType === ScheduleType.MONTHLY) {
        return datefns.isSameMonth(
          new Date(date),
          new Date(session.session_date),
        );
      }
      return datefns.isSameWeek(new Date(date), new Date(session.session_date));
    });
    const completed = Math.floor(sessions.length / repeatPerDay);
    return {
      targetTotal: scheduleDays,
      targetType,
      completed,
    };
  }

  getDatesByScheduleType(
    scheduleType: ScheduleType,
    dateString: string,
  ): { startDate: string; endDate: string } {
    const date = DateTime.fromISO(dateString);
    const endDate = date.endOf('day');
    let startDate = date.startOf('day');
    const isWeekly = scheduleType === ScheduleType.WEEKLY;
    const isDaily = scheduleType === ScheduleType.DAILY;
    const isMonthly = scheduleType === ScheduleType.MONTHLY;
    if (isWeekly || isDaily) {
      startDate = date.startOf('week');
    }
    if (isMonthly) {
      startDate = date.startOf('month');
    }
    return {
      startDate: startDate.toISODate() as string,
      endDate: endDate.toISODate() as string,
    };
  }

  convertMinutesToHoursAndMinutes(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${Number(hours)}h ${Number(minutes)}m`;
  }

  getTimeInHourAndMinutes(time: string): string {
    const dateTime = DateTime.fromSQL(time, { setZone: true });
    return dateTime.toFormat('HH:mm');
  }

  getTotalMinutesFromTime(time: string): number {
    if (!time.includes(':')) {
      return Number(time);
    }
    // timeInHour example:  12:30
    const [hour, minutes] = time.split(':');
    return Number(hour) * 60 + Number(minutes);
  }

  /**
   *
   * @param startDate ISO Date String
   * @param endDate If not passed, Default Today's ISO Date String
   * @returns age difference in years
   */
  getDifferenceInYears(startDate: string, endDate?: string): number {
    if (!endDate) {
      endDate = DateTime.now().toISODate() as string;
    }
    const startDateObj = DateTime.fromISO(startDate);
    const endDateObj = DateTime.fromISO(endDate);

    const differenceInYears = endDateObj.diff(startDateObj, 'years').years;

    if (isNaN(differenceInYears)) {
      throw new BadRequestException('Invalid difference in years');
    }

    return differenceInYears;
  }

  sortTranslatedData<T>(
    data: T[],
    keys: (keyof T)[],
    sortOrder: SortOrder,
  ): T[] {
    return data.sort((a, b) => {
      for (const key of keys) {
        const comparison = sortOrder === SortOrder.ASC ? 1 : -1;

        if (a[key] < b[key]) return -comparison;
        if (a[key] > b[key]) return comparison;
      }
      return 0;
    });
  }

  addPrefixInOrderId(number: number): string {
    const result: number = 1000 + number;
    return result.toString();
  }

  getDaysInMonth(date: Date): number[] {
    const daysInMonth = DateTime.fromJSDate(date).daysInMonth;
    if (!daysInMonth) {
      throw new BadRequestException('Invalid Date');
    }
    return Array.from({ length: daysInMonth }, (value, index) => index + 1);
  }

  getISODateString(date: Date): string {
    const isoDate = DateTime.fromJSDate(date).toISODate();
    if (!isoDate) {
      throw new BadRequestException('Invalid Date provided');
    }
    return isoDate;
  }

  formatDate(date: Date, format: string): string {
    const formatedDate = DateTime.fromJSDate(date).toFormat(format);
    if (!formatedDate) {
      throw new BadRequestException('Date Format Error');
    }
    return formatedDate;
  }

  getDateRange(start: string, end: string): string[] {
    const startDate = DateTime.fromISO(start);
    const endDate = DateTime.fromISO(end);

    if (!startDate.isValid || !endDate.isValid || endDate < startDate) {
      throw new BadRequestException('Invalid date range');
    }

    const dates: string[] = [];

    let currentDate = startDate;

    while (currentDate <= endDate) {
      dates.push(currentDate.toISODate() as string);
      currentDate = currentDate.plus({ days: 1 });
    }

    return dates;
  }

  generateRandomDigitsCode(length: number): string {
    const alphabet = '0123456789';
    const nanoid = customAlphabet(alphabet, length);
    return nanoid();
  }

  async convertHtmlToPdf(html: string): Promise<Buffer> {
    try {
      const nodeEnv = this.configService.getOrThrow<Environment>(
        EnvVariable.NODE_ENV,
      );
      let browser;
      if (nodeEnv !== Environment.LOCAL) {
        browser = await launch({
          executablePath: '/usr/bin/google-chrome',
          args: ['--no-sandbox'],
        });
      } else {
        browser = await launch({});
      }
      const page = await browser.newPage();
      await page.setContent(html);
      const pdf = await page.pdf({ format: 'A4' });
      await browser.close();
      return pdf;
    } catch (error) {
      this.logger.error('Error converting HTML to PDF:', error);
      throw new Error('Failed to convert HTML to PDF');
    }
  }

  async streamToBuffer(inputStream: NodeJS.ReadableStream): Promise<Buffer> {
    const bufferStream = new stream.PassThrough();
    const chunks: Buffer[] = [];

    // Pipe the input stream to a buffer stream
    inputStream.pipe(bufferStream);

    // Use the 'data' event to accumulate chunks
    bufferStream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    // Wait for the stream to end
    await new Promise<void>((resolve) => {
      bufferStream.on('end', resolve);
    });

    // Concatenate all chunks into a single buffer
    const buffer = Buffer.concat(chunks);

    return buffer;
  }

  getSyncAppointmentDateRange(days: number): {
    startDate: string;
    endDate: string;
  } {
    const now = DateTime.utc();
    const startDate = now.minus({ days }).startOf('day').toISO();
    const endDate = now.plus({ days }).endOf('day').toISO();

    if (!startDate || !endDate) {
      throw new BadRequestException(
        'Date range calculation failed for sync appointments',
      );
    }

    return { startDate, endDate };
  }
}
