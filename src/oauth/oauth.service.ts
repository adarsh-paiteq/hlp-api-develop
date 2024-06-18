import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { OauthRepo } from './oauth.repo';
import {
  AddOauthClientBody,
  AddOauthClientInput,
  AddOauthClientResponse,
} from './dto/add-oauth-client.dto';
import { v4 as uuidv4 } from 'uuid';
import { GetOauthClientResponse } from './dto/get-oauth-client.dto';
import { UsersService } from '@users/users.service';
import { randomBytes } from 'crypto';
import {
  AddOauthUser,
  AddOauthUserInput,
  AddOauthUserResponse,
} from './dto/add-outh-user.dto';
import {
  OauthUserAddedBy,
  UserRegistrationStatus,
} from './entities/oauth-users.entity';
import {
  VerifyActivationCodeArgs,
  VerifyActivationCodeResponse,
} from './dto/verify-activation-code.dto';
import { TranslationService } from '@shared/services/translation/translation.service';
import { ResendActivationCodeResponse } from './dto/resend-activation-code.dto';
import { OauthEvent, OauthUserAddedEvent } from './oauth.event';
import { UtilsService } from '@utils/utils.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmailsService } from '@emails/emails.service';

@Injectable()
export class OauthService {
  constructor(
    private readonly oauthRepo: OauthRepo,
    private readonly utilsService: UtilsService,
    private readonly usersService: UsersService,
    private readonly translationService: TranslationService,
    private readonly eventEmitter: EventEmitter2,
    private readonly emailsService: EmailsService,
  ) {}

  async addOauthClient(
    body: AddOauthClientBody,
  ): Promise<AddOauthClientResponse> {
    const organisation = await this.oauthRepo.getOrganisationById(
      body.organization_id,
    );

    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }

    const client_secret = randomBytes(62).toString('base64');

    const oauthClientInput: AddOauthClientInput = {
      client_id: uuidv4(),
      client_secret: client_secret,
      grants: ['client_credentials', 'refresh_token'],
      organization_id: body.organization_id,
    };

    const oauthClient = await this.oauthRepo.addOauthClient(oauthClientInput);

    return {
      message: 'Client added successfully',
      client_id: oauthClient.client_id,
      client_secret: oauthClient.client_secret,
    };
  }

  async getOauthClient(clientId: string): Promise<GetOauthClientResponse> {
    const oauthClient = await this.oauthRepo.getOauthClientById(clientId);

    if (!oauthClient) {
      throw new NotFoundException('Client not found');
    }
    if (oauthClient.is_disabled) {
      throw new UnauthorizedException('Client is disabled');
    }
    return {
      message: 'OK',
      client: oauthClient,
    };
  }

  async verifyActivationCode(
    args: VerifyActivationCodeArgs,
  ): Promise<VerifyActivationCodeResponse> {
    const { code } = args;
    const oauthUser = await this.oauthRepo.getOauthUserByActivationCode(code);
    if (!oauthUser) {
      throw new UnauthorizedException(`oauth_user.incorrect_activation_code`);
    }
    if (oauthUser.status !== UserRegistrationStatus.PENDING) {
      throw new NotFoundException(`oauth_user.activation_code_already_used`);
    }
    return { oauthUser: oauthUser };
  }

  /**
   * @description This function will be used to add oauth users from admin as well as oauth api
   * don't make any breaking changes in this function
   */
  async addOauthUser(
    input: AddOauthUserInput,
    addedBy = OauthUserAddedBy.ADMIN,
  ): Promise<AddOauthUserResponse> {
    const { first_name, last_name, ...oauthUserInput } = input;
    const { email, organisation_id, organisation_patient_id } = input;

    const [oauthUser, user, organisation, organisationPatient] =
      await Promise.all([
        this.oauthRepo.getOauthUserByEmail(email),
        this.oauthRepo.getUserByEmail(email),
        this.oauthRepo.getOrganisationById(organisation_id),
        this.oauthRepo.getOrganisationPatient(
          organisation_patient_id as string,
        ),
      ]);

    if (oauthUser) {
      throw new BadRequestException(`oauth_user.email_already_exist`);
    }

    if (user) {
      throw new BadRequestException(`oauth_user.user_already_exist`);
    }
    if (organisationPatient) {
      throw new BadRequestException(
        `oauth_user.organisation_patient_already_exist`,
      );
    }
    if (!organisation) {
      throw new NotFoundException(`oauth_user.organization_not_found`);
    }

    if (oauthUserInput.client_id && addedBy === OauthUserAddedBy.ADMIN) {
      throw new BadRequestException(`oauth_user.client_id_not_reqired`);
    }

    let code = this.utilsService.generateRandomDigitsCode(6);
    let existingOauthUser = await this.oauthRepo.getOauthUserByActivationCode(
      code,
    );

    while (existingOauthUser?.activation_code === code) {
      code = this.utilsService.generateRandomDigitsCode(6);
      existingOauthUser = await this.oauthRepo.getOauthUserByActivationCode(
        code,
      );
    }

    const displayName =
      first_name && last_name
        ? `${first_name},${last_name}`
        : first_name
        ? first_name
        : last_name
        ? last_name
        : undefined;
    const addOauthUser: AddOauthUser = {
      ...oauthUserInput,
      activation_code: code,
      added_by: addedBy,
      display_name: displayName,
    };

    const savedOauthUser = await this.oauthRepo.addOauthUser(addOauthUser);

    this.eventEmitter.emit(
      OauthEvent.OAUTH_USER_ADDED,
      new OauthUserAddedEvent(savedOauthUser),
    );

    return {
      message: this.translationService.translate(
        `oauth_user.user_added_sucessfully`,
      ),
    };
  }

  async resendActivationCode(
    email: string,
  ): Promise<ResendActivationCodeResponse> {
    const oauthUser = await this.oauthRepo.getOauthUserWithStatusAndEmail(
      email,
      UserRegistrationStatus.PENDING,
    );
    if (!oauthUser) {
      throw new BadRequestException(`oauth_user.user_not_found`);
    }
    await this.emailsService.sendUserActivationCodeEmail(oauthUser);

    return {
      message: this.translationService.translate(
        'oauth_user.activation_code_send_successfully',
      ),
    };
  }
}
