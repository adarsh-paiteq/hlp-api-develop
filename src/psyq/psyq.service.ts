import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PsyqRepo } from './psyq.repo';
import {
  AppointmentEntry,
  IsAliveResponse,
  PsyqAppointmentData,
  PsyqPatientDocumentsResponse,
} from './dto/psyq.dto';
import {
  PatientDocument,
  SavePsyqAppointmentScheduleInput,
  SyncPsyqPatientAppointmentResponse,
} from './dto/sync-psyq-patient-appointments.dto';
import { TranslationService } from '@shared/services/translation/translation.service';
import { Doctor } from '@doctors/entities/doctors.entity';
import {
  SaveScheduleInput,
  SaveUserAppointmentInput,
} from '@schedules/dto/create-schedule.dto';
import { AppointmentType } from '@toolkits/entities/user-appointment.entity';
import { ulid } from 'ulid';
import { ScheduleFor, ScheduleType } from '@schedules/entities/schedule.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ScheduleAddedEvent, ScheduleEvent } from '@schedules/schedule.event';
import { UtilsService } from '@utils/utils.service';
import { UploadsService } from '@uploads/uploads.service';

@Injectable()
export class PsyqService {
  private readonly logger = new Logger(PsyqService.name);
  constructor(
    private readonly psyqRepo: PsyqRepo,
    private readonly translationService: TranslationService,
    private readonly eventEmitter: EventEmitter2,
    private readonly utilsService: UtilsService,
    private readonly uploadsService: UploadsService,
  ) {}

  async isAlive(): Promise<IsAliveResponse> {
    return await this.psyqRepo.isAlive();
  }

  async pepareAndSavePsyqAppointments(
    appointmentEntries: AppointmentEntry[],
    userId: string,
    employeeId: string,
    doctorId: string,
  ): Promise<void> {
    const userAppointments = await this.psyqRepo.getPsyqUserAppointments(
      userId,
    );

    const mappedPayqAppointments: PsyqAppointmentData[] = appointmentEntries
      .filter((entry) => {
        //At index 1 in the identifier array is the unique psyq appointment id for the user and doctor
        const identifier = entry?.resource?.identifier?.[1] || undefined;
        this.logger.warn(
          `identifier not found for psyq appointment ${entry.resource.id}`,
        );
        if (!identifier?.value) {
          return false;
        }
        return !userAppointments.some(
          (appointment) => appointment.psyq_appointment_id === identifier.value,
        );
      })
      .map((entry) => {
        const identifier = entry?.resource?.identifier?.[1] || undefined;
        const appointment = entry.resource;
        const doctor = appointment.participant.find(
          (p) => p.actor.type === 'Practitioner',
        );
        const patient = appointment.participant.find(
          (p) => p.actor.type === 'Patient',
        );
        const location = appointment.participant.find(
          (p) => p.actor.type === 'Location',
        );

        return {
          //  description: appointment.description,
          psyqAppointmentId: identifier?.value || '',
          start: appointment.start,
          end: appointment.end,
          note: appointment.comment,
          employeeId: doctor?.actor.identifier.value,
          patientId: patient?.actor.identifier.value,
          location: location?.actor.display,
        };
      })
      .filter((psyqAppointment) => {
        // if there's no doctor psyqAppointment.employeeId we can't add the appointment schedule
        if (psyqAppointment.employeeId !== employeeId) {
          this.logger.log(
            `Psyq appointment ${psyqAppointment.psyqAppointmentId} is not for the doctor ${employeeId}`,
          );
          return false;
        }
        return true;
      });

    if (mappedPayqAppointments.length) {
      await this.savePsyqAppointmentSchedule(
        mappedPayqAppointments,
        userId,
        doctorId,
      );
    }
  }

  async uploadAndSavePsyqPatientDocument(
    psyqDocumentsResponse: PsyqPatientDocumentsResponse,
    organisationPatientId: string,
  ): Promise<PatientDocument | undefined> {
    const documentId =
      psyqDocumentsResponse?.entry[0]?.resource?.id || undefined;

    if (!documentId) {
      this.logger.warn(`document_id not found in psyq documents response `);
      return;
    }
    const documentResponse = await this.psyqRepo.getPsyqPatientDocument(
      organisationPatientId,
      documentId,
    );

    if (!documentId) {
      this.logger.warn(`psyq document not found `);
      return;
    }

    if (!documentResponse?.content?.base64EncodedBinary) {
      return;
    }

    const file = await this.uploadsService.base64ToFile(
      documentResponse.content.base64EncodedBinary,
      documentResponse.content.filename,
      documentResponse.content.contentType,
    );

    const { file_id, file_path, image_url } =
      await this.uploadsService.uploadDocument(file);
    //TODO:save document to db
    return {
      id: file_id,
      file_path,
      image_url,
      title: documentResponse.code.text,
      description: '',
    };
  }

  async savePsyqAppointmentSchedule(
    psyqAppointmentData: PsyqAppointmentData[],
    userId: string,
    doctorId: string,
  ): Promise<void> {
    const treatment = await this.psyqRepo.getActiveTreatment(userId);

    psyqAppointmentData.forEach(async (appointment) => {
      const saveUserAppointment: SaveUserAppointmentInput = {
        id: ulid(),
        appointment_type: AppointmentType.OTHER,
        doctor_id: doctorId,
        user_id: userId,
        location: appointment.location || '',
        note: appointment.note,
        psyq_appointment_id: appointment.psyqAppointmentId,
        session_form_enabled: false,
        complaint_form_enabled: false,
      };

      const userAppointment = await this.psyqRepo.saveUserAppointment(
        saveUserAppointment,
      );

      const baseInput: SavePsyqAppointmentScheduleInput = {
        user_appointment_id: userAppointment.id,
        user_appointment_title: AppointmentType.OTHER,
        schedule_for: ScheduleFor.APPOINTMENT,
        schedule_type: ScheduleType.ONE_TIME,
        start_date: appointment.start,
        end_date: appointment.end,
        show_reminder: false,
        repeat_per_day: 0,
        created_by: doctorId, //TODO: check if this is correct
      };

      if (treatment?.id) {
        baseInput.treatment_id = treatment.id;
      }

      // Create Psyq Appointment schedule for Doctor
      const saveDoctorScheduleInput: SaveScheduleInput = {
        ...baseInput,
        user: userAppointment.doctor_id,
      };

      // Create Psyq Appointment schedule for user
      const saveUserScheduleInput: SaveScheduleInput = {
        ...baseInput,
        user: userAppointment.user_id,
      };

      const [userSchedule] = await Promise.all([
        this.psyqRepo.saveSchedule(saveUserScheduleInput),
        this.psyqRepo.saveSchedule(saveDoctorScheduleInput),
      ]);

      //event will only be emitted for user appointment schedule
      this.eventEmitter.emit(
        ScheduleEvent.SCHEDULE_ADDED,
        new ScheduleAddedEvent(userSchedule),
      );
    });
  }

  async syncPsyqPatientAppointments(
    userId: string,
    doctorId: string,
  ): Promise<SyncPsyqPatientAppointmentResponse> {
    const [oauthUser, doctor] = await Promise.all([
      this.psyqRepo.getOauthUserByUserId(userId),
      this.psyqRepo.getUserById<Doctor>(doctorId),
    ]);

    if (!oauthUser) {
      throw new NotFoundException(`psyq.oauth_user_data_not_found`);
    }
    if (!doctor) {
      throw new NotFoundException(`psyq.doctor_not_found`);
    }

    let { organisation_patient_id } = oauthUser;
    if (!organisation_patient_id) {
      organisation_patient_id = '3434';
      // throw new BadRequestException(
      //   `psyq.organisation_patient_id_not_available`,
      // );
    }

    let employeeId = doctor.employee_number ? doctor.employee_number : null;

    if (!employeeId) {
      const psyqEmployee = await this.psyqRepo.getEmployeeByEmail(doctor.email);
      if (!psyqEmployee) {
        throw new NotFoundException(`psyq.employee_not_found`);
      }
      employeeId = psyqEmployee.id;
    }

    //startdate 30 days before and enddate 30 days after
    // const { startDate, endDate } =
    //   this.utilsService.getSyncAppointmentDateRange(30);
    //TODO: remove this hardcoded date
    const startDate = '2024-04-01T00:00:00.000+0000';
    const endDate = '2024-08-01T23:59:59.000+0000';

    const [psyqAppointmentResponse, psyqDocumentsResponse] = await Promise.all([
      this.psyqRepo.getPsyqPatientAppointments(
        organisation_patient_id,
        startDate,
        endDate,
      ),
      this.psyqRepo.getPsyqPatientDocuments(
        organisation_patient_id,
        startDate,
        endDate,
      ),
    ]);

    if (psyqAppointmentResponse.entry?.length) {
      await this.pepareAndSavePsyqAppointments(
        psyqAppointmentResponse.entry || [],
        userId,
        employeeId,
        doctorId,
      );
    }

    let patientDocument: PatientDocument | undefined = undefined;

    if (psyqDocumentsResponse.entry?.length) {
      patientDocument = await this.uploadAndSavePsyqPatientDocument(
        psyqDocumentsResponse,
        organisation_patient_id,
      );
    }

    return {
      message: this.translationService.translate(
        `psyq.appointments_synced_successfully`,
      ),
      patientDocument,
    };
  }
}
