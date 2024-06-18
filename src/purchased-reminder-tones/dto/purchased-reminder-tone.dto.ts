import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@ArgsType()
export class PurchasedReminderToneArgs {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  reminderToneId: string;
}
