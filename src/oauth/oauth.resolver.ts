import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { OauthService } from './oauth.service';
import { RolesGuard } from '@shared/guards/roles.guard';
import { JwtAuthGuard } from '@shared/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { UserRoles } from '@users/users.dto';
import { Roles } from '@shared/decorators/roles.decorator';
import {
  VerifyActivationCodeArgs,
  VerifyActivationCodeResponse,
} from './dto/verify-activation-code.dto';
import {
  AddOauthUserInput,
  AddOauthUserResponse,
} from './dto/add-outh-user.dto';
import {
  ResendActivationCodeArgs,
  ResendActivationCodeResponse,
} from './dto/resend-activation-code.dto';

@Resolver()
export class OauthResolver {
  constructor(private readonly oauthService: OauthService) {}

  @Mutation(() => VerifyActivationCodeResponse, {
    name: 'verifyActivationCode',
  })
  async verifyActivationCode(
    @Args() args: VerifyActivationCodeArgs,
  ): Promise<VerifyActivationCodeResponse> {
    return await this.oauthService.verifyActivationCode(args);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => AddOauthUserResponse, { name: 'addOauthUser' })
  async addOauthUser(
    @Args('input') input: AddOauthUserInput,
  ): Promise<AddOauthUserResponse> {
    return this.oauthService.addOauthUser(input);
  }

  @Mutation(() => ResendActivationCodeResponse, {
    name: 'resendActivationCode',
  })
  async resendActivationCode(
    @Args() args: ResendActivationCodeArgs,
  ): Promise<ResendActivationCodeResponse> {
    return await this.oauthService.resendActivationCode(args.email);
  }
}
