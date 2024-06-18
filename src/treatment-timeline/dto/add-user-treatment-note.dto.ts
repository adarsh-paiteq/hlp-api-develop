import { Field, InputType } from '@nestjs/graphql';
import { AddTreatmentNoteInput } from './add-treatment-note.dto';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class AddUserTreatmentNoteInput extends AddTreatmentNoteInput {
  @Field(() => Boolean, { nullable: false })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  is_private_note: boolean;

  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  user_id: string;
}
