import { ArgsType, Field, ObjectType, PickType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { Organisation } from '../entities/organisations.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class GetOrganisationsArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field(() => String, {
    nullable: true,
  })
  name?: string;
}

@ObjectType()
export class GetOrganisationsResponse {
  @Field(() => [OrganisationList], { nullable: true })
  organisationList: OrganisationList[];
}

@ObjectType()
export class OrganisationList extends PickType(Organisation, [
  'id',
  'name',
  'is_default',
]) {}
