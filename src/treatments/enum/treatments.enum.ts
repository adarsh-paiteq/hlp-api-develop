import { registerEnumType } from '@nestjs/graphql';

export enum TreatmentType {
  START_PROGRAM = 'START_PROGRAM',
  AFTERCARE = 'AFTERCARE',
  OTHER = 'OTHER',
}

registerEnumType(TreatmentType, { name: 'TreatmentType' });
