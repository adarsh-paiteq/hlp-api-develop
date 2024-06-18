import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ServiceCategory {
  title: string;
  created_at: Date;
  updated_at: Date;
  id: string;
}
