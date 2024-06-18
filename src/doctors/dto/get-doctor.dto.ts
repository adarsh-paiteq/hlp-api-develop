import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { Doctor } from '../entities/doctors.entity';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class GetDoctorArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  doctorId: string;
}
@ObjectType()
export class GetDoctorResponse extends Doctor {}
