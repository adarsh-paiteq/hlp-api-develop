import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { UserStatus } from '@users/entities/user-status-info.entity';
import { IsEnum, IsNotEmpty } from 'class-validator';

@ArgsType()
export class UpdateDoctorStatusArgs {
  @Field(() => UserStatus, {
    nullable: false,
    description: `Status must be ${Object.values(UserStatus)}`,
  })
  @IsEnum(UserStatus, { message: i18nValidationMessage('is_enum') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  status: UserStatus;
}

@ObjectType()
export class UpdateDoctorStatusResp {
  @Field()
  message: string;
}
