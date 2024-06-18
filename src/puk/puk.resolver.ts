import { Args, Query, Resolver } from '@nestjs/graphql';
import {
  ResendActivationCodeArgs,
  PukResendActivationCodeApiResponse,
  VerifyPukArgs,
  VerifyPukOutput,
} from './puk.model';

import { PukService } from './puk.service';

@Resolver()
export class PukResolver {
  constructor(private readonly pukService: PukService) {}

  @Query(() => VerifyPukOutput)
  async verifyPuk(@Args() input: VerifyPukArgs): Promise<VerifyPukOutput> {
    return this.pukService.verifyCode(input);
  }

  @Query(() => PukResendActivationCodeApiResponse)
  async resendPukActivationCode(
    @Args() args: ResendActivationCodeArgs,
  ): Promise<PukResendActivationCodeApiResponse> {
    return this.pukService.resendActivationCode(args);
  }
}
