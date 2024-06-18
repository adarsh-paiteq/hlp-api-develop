import { DateTime } from 'luxon';

export function getISODate(date: Date): string {
  return DateTime.fromJSDate(date).toISODate() as string;
}

export function getUTCDate(date: Date): string {
  return DateTime.fromJSDate(date).toUTC().toISO() as string;
}
