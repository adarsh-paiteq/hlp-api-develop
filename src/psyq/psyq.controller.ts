import { Controller, Get, UseGuards } from '@nestjs/common';
import { PsyqService } from './psyq.service';
import { Roles } from '@shared/decorators/roles.decorator';
import { UserRoles } from '@users/users.dto';
import { JwtAuthGuard } from '@shared/guards/auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { IsAliveResponse } from './dto/psyq.dto';

@Controller('psyq')
export class PsyqController {
  constructor(private readonly psyqService: PsyqService) {}

  @Get('/is-alive')
  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async isAlive(): Promise<IsAliveResponse> {
    return await this.psyqService.isAlive();
  }
}
