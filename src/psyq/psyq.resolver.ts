import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { RolesGuard } from '@shared/guards/roles.guard';
import { JwtAuthGuard } from '@shared/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { UserRoles } from '@users/users.dto';
import { Roles } from '@shared/decorators/roles.decorator';
import {
  SyncPsyqPatientAppointmentArgs,
  SyncPsyqPatientAppointmentResponse,
} from './dto/sync-psyq-patient-appointments.dto';
import { LoggedInUser } from '@shared/auth/jwt.strategy';
import { GetUser } from '@shared/decorators/user.decorator';
import { PsyqService } from './psyq.service';

@Resolver()
export class PsyqResolver {
  constructor(private readonly psyqService: PsyqService) {}

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => SyncPsyqPatientAppointmentResponse, {
    name: 'syncPsyqPatientAppointments',
  })
  async syncPsyqPatientAppointments(
    @GetUser() user: LoggedInUser,
    @Args() args: SyncPsyqPatientAppointmentArgs,
  ): Promise<SyncPsyqPatientAppointmentResponse> {
    return await this.psyqService.syncPsyqPatientAppointments(
      args.user_id,
      user.id,
    );
  }
}
