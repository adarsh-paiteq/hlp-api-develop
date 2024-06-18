import { Field, ObjectType } from '@nestjs/graphql';
import { ServiceCategory } from '../entities/service-category.entity';
import { Service } from '../entities/service.entity';
import { ServiceOffer } from '../entities/service-offer.entity';
import { ServiceCompany } from '../entities/service-company.entity';
import { Users } from '../../users/users.model';

@ObjectType()
export class ServiceWithServiceOffer extends Service {
  @Field(() => ServiceCompany)
  service_companies: ServiceCompany;

  @Field(() => [ServiceOffer])
  service_offers: ServiceOffer;
}

@ObjectType()
export class ServiceCategoryWithService extends ServiceCategory {
  @Field(() => [ServiceWithServiceOffer])
  services: ServiceWithServiceOffer;
}

@ObjectType()
export class GetServiceListResponse {
  @Field(() => [ServiceCategoryWithService])
  serviceList: ServiceCategoryWithService[];

  @Field(() => Users)
  user: Users;
}
