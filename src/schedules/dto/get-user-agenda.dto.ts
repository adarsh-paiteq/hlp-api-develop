import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { GetDashboardArgs, UserSchedule } from './get-dashboard.dto';

@ArgsType()
export class GetUserAgendaArgs extends GetDashboardArgs {}

@ObjectType()
export class GetUserAgendaResponse {
  @Field(() => [UserSchedule], { nullable: 'items' })
  agenda: UserSchedule[];

  @Field(() => Boolean)
  has_more: boolean;
}
