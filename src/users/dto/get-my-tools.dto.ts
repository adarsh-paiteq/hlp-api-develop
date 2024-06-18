import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { Toolkit } from '../../toolkits/toolkits.model';

@ObjectType()
export class GetMyToolsResponse {
  @Field(() => Boolean, {
    defaultValue: false,
    description: 'If has more tookits it will be true',
  })
  has_more: boolean;

  @Field(() => [Toolkit], { nullable: true })
  toolkits: Toolkit[];
}

@ArgsType()
export class GetMyToolsArgs extends PaginationArgs {}
