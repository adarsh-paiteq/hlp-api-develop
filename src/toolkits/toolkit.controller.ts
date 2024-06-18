import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { UserRoles } from '../users/users.dto';
import { ToolkitService } from './toolkit.service';
import { GetToolkitGraphArgs, GetToolkitGraphResponse } from './toolkits.model';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { LoggedInUser } from '../shared/auth/jwt.strategy';
import { GetUser } from '../shared/decorators/user.decorator';

@Controller('toolkits')
export class ToolkitController {
  constructor(private readonly toolkitService: ToolkitService) {}
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)

  /**
   * @deprecated Unable to find in Action and Event but it's migrated to  getToolkitGraphData
   */
  @Post('/graph')
  async getGraphData(
    @GetUser() user: LoggedInUser,
    @Body() args: GetToolkitGraphArgs,
  ): Promise<GetToolkitGraphResponse> {
    return this.toolkitService.getToolkitGraph(user.id, args);
  }
}
