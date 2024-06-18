import { Type } from 'class-transformer';
import { Allow, IsOptional } from 'class-validator';

export class Occupant {
  @Allow()
  name: string;

  @Allow()
  id: string;

  @Allow()
  occupant_jid: string;

  @Allow()
  email: string;

  @Allow()
  joined_at: number;
}

export class OccupantJoinedEventPayload {
  @Allow()
  room_jid: string;

  @Allow()
  is_breakout: boolean;

  @Allow()
  @Type(() => Occupant)
  occupant: Occupant;

  @Allow()
  room_name: string;

  @Allow()
  event_name: string;

  @Allow()
  @IsOptional()
  breakout_room_id?: string;
}
