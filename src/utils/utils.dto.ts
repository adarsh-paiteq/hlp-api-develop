import { registerEnumType } from '@nestjs/graphql';

export enum ToolkitTargetType {
  WEEKLY = 'Weekly Target',
  DAILY = 'daily_toolkit_type',
  MONTHLY_TARGET = 'Monthly Target',
}

export const ToolkitTargets = new Map<string, string>(
  Object.entries(ToolkitTargetType),
);

export class ToolkitTarget {
  targetTotal: number;
  targetType: ToolkitTargetType;
  completed: number;
}

export enum HasuraEventTriggerOperation {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  MANUAL = 'MANUAL',
}

export type ObjectValue<T> = T[keyof T];

export class Translation {
  en: Record<string, string>;
  nl: Record<string, string>;
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}
registerEnumType(SortOrder, { name: 'SortOrder' });
