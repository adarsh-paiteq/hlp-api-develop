import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InvitationsRepo } from './invitations.repo';
import {
  InsertAddOauthUser,
  InsertPatientInvitation,
  InvitePatientInput,
  InvitePatientOutput,
} from './dto/invite-patient.dto';
import { PaitentInvitationStatus } from './entities/patient-invitations.entity';
import { TranslationService } from '@shared/services/translation/translation.service';
import { AuthService } from '@shared/auth/auth.service';
import { v4 as uuidv4 } from 'uuid';
import { InvitePatientResponse } from './dto/verify-patient-invitation.dto';
import {
  OauthUserAddedBy,
  UserRegistrationStatus,
} from '@oauth/entities/oauth-users.entity';
import { UtilsService } from '@utils/utils.service';
import { OauthEvent, OauthUserAddedEvent } from '@oauth/oauth.event';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);
  constructor(
    private readonly invitationsRepo: InvitationsRepo,
    private readonly translationService: TranslationService,
    private readonly authService: AuthService,
    private readonly utilsService: UtilsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async invitePatient(
    input: InvitePatientInput,
    doctorId: string,
  ): Promise<InvitePatientOutput> {
    const user = await this.invitationsRepo.getUserByEmail(input.email);
    if (user) {
      throw new NotFoundException(`users.email_already_exists`);
    }
    const oauthUserExist =
      await this.invitationsRepo.getOauthUserWithStatusAndEmail(
        input.email,
        UserRegistrationStatus.REGISTERED,
      );

    if (oauthUserExist) {
      throw new BadRequestException(`users.email_already_exists`);
    }

    const doctor = await this.invitationsRepo.getDoctorById(doctorId);
    if (!doctor) {
      throw new NotFoundException(`doctors.doctor_not_found`);
    }

    const insertInvitationInput: InsertPatientInvitation = {
      ...input,
      organization_id: doctor.organization_id,
      doctor_id: doctor.id,
      status: PaitentInvitationStatus.PENDING,
      id: uuidv4(),
      token_id: uuidv4(),
    };

    let code = this.utilsService.generateRandomDigitsCode(6);
    let existingOauthUser =
      await this.invitationsRepo.getOauthUserByActivationCode(code);

    while (existingOauthUser?.activation_code === code) {
      code = this.utilsService.generateRandomDigitsCode(6);
      existingOauthUser =
        await this.invitationsRepo.getOauthUserByActivationCode(code);
    }

    const displayName = `${input.first_name},${input.last_name}`;

    const insertAddOuthInput: InsertAddOauthUser = {
      display_name: displayName,
      added_by: OauthUserAddedBy.ADMIN,
      activation_code: code,
      organisation_id: doctor.organization_id,
      email: input.email,
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, id, ...updateInvitationInput } = insertInvitationInput;

    const existingInvitation = await this.invitationsRepo.getPatientInvitation({
      email,
    });

    const [oauthUser] = existingInvitation
      ? await Promise.all([
          this.invitationsRepo.updateOauthUser(insertAddOuthInput, email),
          this.invitationsRepo.updatePatientInvitation(
            updateInvitationInput,
            email,
          ),
        ])
      : await Promise.all([
          this.invitationsRepo.insertOauthUser(insertAddOuthInput),
          this.invitationsRepo.insertPatientInvitation(insertInvitationInput),
        ]);

    this.eventEmitter.emit(
      OauthEvent.OAUTH_USER_ADDED,
      new OauthUserAddedEvent(oauthUser),
    );
    return {
      message: this.translationService.translate(`invitations.invitation_sent`),
    };
  }

  async verifyPatientInvitation(token: string): Promise<InvitePatientResponse> {
    const jwtPayload = await this.authService.verifyPatientInvitationEmailToken(
      token,
    );

    const patientInvitation = await this.invitationsRepo.getPatientInvitation({
      id: jwtPayload.id,
    });
    if (!patientInvitation) {
      throw new NotFoundException(`invitations.invitation_not_found`);
    }

    const isValid =
      !!jwtPayload.jti && patientInvitation.token_id === jwtPayload.jti;

    if (!isValid) {
      throw new BadRequestException(`invitations.invalid_token`);
    }

    return { patientInvitation };
  }
}
