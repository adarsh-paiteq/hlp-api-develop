import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InvitationsService } from './invitations.service';
import { Roles } from '@shared/decorators/roles.decorator';
import { UserRoles } from '../users/users.dto';
import { UseGuards } from '@nestjs/common';
import { LoggedInUser } from '@shared/auth/jwt.strategy';
import { GetUser } from '@shared/decorators/user.decorator';
import { JwtAuthGuard } from '@shared/guards/auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import {
  InvitePatientOutput,
  InvitePatientInput,
} from './dto/invite-patient.dto';
import {
  InvitePatientResponse,
  VerifyPatientInvitationArgs,
} from './dto/verify-patient-invitation.dto';

@Resolver()
export class InvitationsResolver {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => InvitePatientOutput, {
    name: 'invitePatient',
    description:
      'Used in Doctors CMS to invite new patient(user) to register on superbrains app',
  })
  async invitePatient(
    @GetUser() user: LoggedInUser,
    @Args({ name: 'input' }) input: InvitePatientInput,
  ): Promise<InvitePatientOutput> {
    return this.invitationsService.invitePatient(input, user.id);
  }

  @Query(() => InvitePatientResponse, {
    name: 'verifyPatientInvitation',
    description: 'used to verify the patient invitation token',
  })
  async verifyPatientInvitation(
    @Args() args: VerifyPatientInvitationArgs,
  ): Promise<InvitePatientResponse> {
    return this.invitationsService.verifyPatientInvitation(args.token);
  }
}
