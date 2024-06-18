import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { OauthService } from './oauth.service';
import {
  AddOauthClientBody,
  AddOauthClientResponse,
} from './dto/add-oauth-client.dto';
import { Roles } from '@shared/decorators/roles.decorator';
import { UserRoles } from '@users/users.dto';
import { JwtAuthGuard } from '@shared/guards/auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import {
  GetOauthClientParams,
  GetOauthClientResponse,
} from './dto/get-oauth-client.dto';
import { OAuth } from '@shared/decorators/oauth.decorator';
import {
  AddOauthUserInput,
  AddOauthUserResponse,
} from './dto/add-outh-user.dto';
import { OauthUserAddedBy } from './entities/oauth-users.entity';

@Controller('oauth')
export class OauthController {
  constructor(private readonly oauthService: OauthService) {}

  @Post('/client')
  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async addOauthClient(
    @Body() body: AddOauthClientBody,
  ): Promise<AddOauthClientResponse> {
    return this.oauthService.addOauthClient(body);
  }

  @OAuth()
  @Get('/client/:id')
  async getOauthClient(
    @Param() params: GetOauthClientParams,
  ): Promise<GetOauthClientResponse> {
    return this.oauthService.getOauthClient(params.id);
  }

  @OAuth()
  @Post('/user')
  async addUser(
    @Body() body: AddOauthUserInput,
  ): Promise<AddOauthUserResponse> {
    return this.oauthService.addOauthUser(body, OauthUserAddedBy.OAUTH_API);
  }
}
