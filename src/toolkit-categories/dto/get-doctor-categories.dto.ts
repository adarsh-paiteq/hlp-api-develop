import { ObjectType } from '@nestjs/graphql';
import { GetToolkitCategoriesResponse } from '../toolkit-categories.model';

@ObjectType()
export class GetDoctorToolkitCategoriesResponse extends GetToolkitCategoriesResponse {}
