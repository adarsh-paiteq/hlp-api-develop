import { Resolver, Query, Args } from '@nestjs/graphql';
import { OrganisationsService } from './organisations.service';
import {
  GetOrganisationsArgs,
  GetOrganisationsResponse,
} from './dto/get-organisations.dto';
import { GetManualList } from './dto/get-manuals-list.dto';
import { GetExplanationVideosListResponse } from './dto/get-explanation-video-list.dto';
import { Roles } from '@shared/decorators/roles.decorator';
import { UserRoles } from '@users/users.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@shared/guards/auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { LoggedInUser } from '@shared/auth/jwt.strategy';
import { GetUser } from '@shared/decorators/user.decorator';
import { I18nNextLanguage } from '@shared/decorators/language.decorator';

@Resolver()
export class OrganisationsResolver {
  constructor(private readonly organisationsService: OrganisationsService) {}

  @Query(() => GetOrganisationsResponse, { name: 'getOrganisations' })
  async getOrganisations(
    @Args() args: GetOrganisationsArgs,
  ): Promise<GetOrganisationsResponse> {
    return this.organisationsService.getOrganisations(args.name);
  }

  @Query(() => GetManualList, { name: 'getManualList' })
  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getManualList(
    @I18nNextLanguage() lang: string,
    @GetUser() doctor: LoggedInUser,
  ): Promise<GetManualList> {
    return await this.organisationsService.getManualList(
      lang,
      doctor.organization_id,
    );
  }

  @Query(() => GetExplanationVideosListResponse, {
    name: 'getExplanationVideoList',
  })
  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getExplanationVideoList(
    @GetUser() doctor: LoggedInUser,
    @I18nNextLanguage() lang: string,
  ): Promise<GetExplanationVideosListResponse> {
    return await this.organisationsService.getExplanationVideoList(
      lang,
      doctor.organization_id,
    );
  }
}
