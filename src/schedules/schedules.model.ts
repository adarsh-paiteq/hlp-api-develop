import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsISO8601, IsUUID } from 'class-validator';
import { Quote } from './entities/quote.entity';
import { QuoteImage } from './entities/quote-image.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ObjectType()
export class Schedule {
  repeat_per_month?: number[];
  schedule_days?: string[];
  is_completed: boolean;
  is_schedule_disabled: boolean;
  show_reminder: boolean;
  @Field(() => String)
  end_date?: string | Date | undefined;

  @Field(() => String)
  start_date: string | Date;
  repeat_per_day?: number;
  schedule_for: string;
  schedule_type: string;
  created_at: string;
  updated_at: string;
  @Field(() => String)
  challenge_id?: string;
  check_in?: string;
  id: string;
  tool_kit?: string;
  user: string;
}

@ArgsType()
export class UpdateScheduleRemindersArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  scheduleId: string;

  @Field({ nullable: 'items' })
  @IsISO8601({ strict: true }, { each: true })
  reminders: string[];
}

@ObjectType()
export class UpdateScheduleRemindersResponse {
  affectedRows: number;
}
export class QuoteWithImages extends Quote {
  id: string;
  image_id: string;
  image_url: string;
  file_path: string;
  created_at: string;
  updated_at: string;
  images: QuoteImage[];
}
