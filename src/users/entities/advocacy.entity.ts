import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Advocacy {
  advocacy_info: string;
  id: string;
}
