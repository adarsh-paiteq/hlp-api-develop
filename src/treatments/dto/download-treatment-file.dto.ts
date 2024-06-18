import { i18nValidationMessage } from '@core/modules/i18n-next';
import { PickType } from '@nestjs/graphql';
import { AppointmentType } from '@toolkits/entities/user-appointment.entity';
import { DoctorTreatment } from '@treatments/entities/doctor-treatments.entity';
import { Treatment } from '@treatments/entities/treatments.entity';
import { Users } from '@users/users.model';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { TreatmentRoles } from './add-treatment.dto';
import { UserRoles } from '@users/users.dto';

export class DownloadTreatmentFileQuery {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  treatmentId: string;
}

export class TreatmentAndUserDTO extends Treatment {
  users: Users;
}

export class DoctorInfo extends PickType(Users, [
  'id',
  'avatar_image_name',
  'user_name',
  'first_name',
  'last_name',
  'role',
]) {
  file_path?: string;
}

export class TreatmentDoctorData extends DoctorTreatment {
  doctor: DoctorInfo;
}

export class UserGoalLevel {
  id: string;
  title: string;
}

export class UserGoalsWithGoalLevel {
  id: string;
  title: string;
  user_goal_level: UserGoalLevel;
}

export class UserTreatmentAppointment {
  user_appointment_id: string;
  doctor_first_name: string;
  doctor_last_name: string;
  doctor_role: TreatmentRoles;
  start_date: string;
  end_date: string;
  appointment_type: AppointmentType;
  location: string;
}

export class UserTreatmentTimelineNote {
  title: string;
  description: string;
  is_private_note: boolean;
  role: UserRoles;
  created_at: Date;
}
export class TermsAndConditionsAndPrivacyPolicy {
  terms_and_condition_info: string;
  privacy_policy_info: string;
}

export class TreatmentFileData {
  treatment: TreatmentAndUserDTO;
  treatmentDoctors: TreatmentDoctorData[];
  userGoalsWithGoalLevel: UserGoalsWithGoalLevel[];
  treatmentAppointments: UserTreatmentAppointment[];
  treatmentTimelineNotes: UserTreatmentTimelineNote[];
  termsAndConditionsAndPrivacyPolicy: TermsAndConditionsAndPrivacyPolicy;
}
