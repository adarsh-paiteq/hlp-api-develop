import { Resolver, Query } from '@nestjs/graphql';
import { Roles } from '@shared/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@shared/guards/auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import { GetUser } from '@shared/decorators/user.decorator';
import { LoggedInUser } from '@shared/auth/jwt.strategy';
import { DigidService } from './digid.service';
import { GetDigidLoginStatusResponse } from './dto/get-digid-session-status';

@Resolver()
export class DigidResolver {
  constructor(private readonly digidService: DigidService) {}

  @Query(() => GetDigidLoginStatusResponse, {
    name: 'getDigidLoginStatus',
  })
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async isDigidSessionActive(
    @GetUser() user: LoggedInUser,
  ): Promise<GetDigidLoginStatusResponse> {
    return await this.digidService.getDigidLoginStatus(user.id);
  }
}
