import { HideField } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

export class ExtraInformation {
  id: string;
  extra_information_type: string;
  extra_information_title: string;
  extra_information_description: string;
  created_at: string;
  updated_at: string;
  @HideField()
  translations?: Translation;
}
