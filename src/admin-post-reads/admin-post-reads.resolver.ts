import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { LoggedInUser } from '../shared/auth/jwt.strategy';
import { Roles } from '../shared/decorators/roles.decorator';
import { GetUser } from '../shared/decorators/user.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import { AdminPostReadsService } from './admin-post-reads.service';
import { AdminPostReadArgs } from './dto/admin-post-read.dto';
import { AdminPostRead } from './entities/admin-post-read.entity';

@Resolver()
export class AdminPostReadsResolver {
  constructor(private readonly adminPostReadsService: AdminPostReadsService) {}

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => AdminPostRead, { name: 'adminPostRead' })
  async postRead(
    @GetUser() user: LoggedInUser,
    @Args() args: AdminPostReadArgs,
  ): Promise<AdminPostRead> {
    return this.adminPostReadsService.adminPostRead(user.id, args.postId);
  }
}
