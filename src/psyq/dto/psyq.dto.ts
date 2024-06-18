export class IsAliveResponse {
  available: boolean;
  timestamp: string;
}

export class PsyqAppointmentResponse {
  resourceType: string;
  id: string;
  meta: Meta;
  type: string;
  total: string;
  entry?: AppointmentEntry[];
  issue?: Issue[];
}

export class AppointmentEntry {
  fullUrl: string;
  resource: Resource;
  search: Search;
}

export class Resource {
  resourceType: string;
  id: string;
  extension: ResourceExtension[];
  identifier?: Identifier[];
  status: string;
  serviceType: ServiceType[];
  description: string;
  comment?: string;
  start: string;
  end: string;
  minutesDuration: number;
  created: string;
  participant: Participant[];
}

export class ResourceExtension {
  url: string;
  valueBoolean?: boolean;
  valueCoding?: Coding;
  valueString?: string;
}

export class Coding {
  system: string;
  code: string;
  display?: string;
}

export class Identifier {
  use: Use;
  system: string;
  value?: string;
}

export enum Use {
  Usual = 'usual',
}

export class Participant {
  id?: string;
  extension?: ParticipantExtension[];
  type?: Type[];
  actor: Actor;
  status?: string;
}

export class Actor {
  type: string;
  identifier: Identifier;
  display: string;
}

export class ParticipantExtension {
  url: string;
  valueInteger?: number;
  valueDateTime?: string;
  valueReference?: ValueReference;
}

export class ValueReference {
  reference: string;
  type: string;
  identifier: Identifier;
  display: string;
}

export class Type {
  text: string;
}

export class ServiceType {
  extension?: ServiceTypeExtension[];
  coding: Coding[];
}

export class ServiceTypeExtension {
  url: string;
  valueCoding: ValueCoding;
}

export class ValueCoding {
  code: string;
  display: string;
}

export class Search {
  mode: string;
}

export class Meta {
  lastUpdated: string;
}

export class PsyqAppointmentData {
  psyqAppointmentId?: string;
  start: string;
  end: string;
  note: string | undefined;
  employeeId: string | undefined;
  patientId: string | undefined;
  location: string | undefined;
}

export class PsyqEmployee {
  id: string;
  extension: Extension[];
  identifier: PsyqEmployeeIdentifier[];
  name: Name[];
}

export class Extension {
  url: string;
  valueString: string;
}

export class PsyqEmployeeIdentifier {
  use: string;
  system: string;
  value: string;
}

export class Name {
  family: string;
  given: string[];
}

export class Issue {
  severity: string;
  details: Details;
}

export class Details {
  coding: Coding[];
  text: string;
}

export interface PsyqPatientDocumentsResponse {
  resourceType: string;
  id: string;
  meta: Meta;
  type: string;
  total: string;
  entry: DocumentEntry[];
  issue?: Issue[];
}

export class DocumentEntry {
  fullUrl: string;
  resource: DocumentResource;
  search: Search;
}

export class DocumentResource {
  resourceType: string;
  id: string;
  extension: Extension[];
  identifier: Identifier[];
  status: string;
  created: string;
  code: Code;
  performer: Performer;
  valueAttachment?: ValueAttachment;
}

export class Code {
  text: string;
}

export class Performer {
  type: string;
  identifier: Identifier;
  display: string;
}

export class ValueAttachment {
  contentType: string;
  url: string;
}

export class PsyqPatientDocumentResponse {
  id: string;
  extension: Extension[];
  identifier: Identifier[];
  status: string;
  created: string;
  code: Code;
  performer: Performer;
  content: Content;
  issue?: Issue[];
}

export class Content {
  base64EncodedBinary: string;
  contentType: string;
  filename: string;
}
