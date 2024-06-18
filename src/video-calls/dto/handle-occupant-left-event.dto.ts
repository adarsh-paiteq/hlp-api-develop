import { Type } from 'class-transformer';
import { Allow, IsOptional } from 'class-validator';

export class Occupant {
  @Allow()
  name: string;

  @Allow()
  email: string;

  @Allow()
  id: string;

  @Allow()
  occupant_jid: string;

  @Allow()
  joined_at: number;

  @Allow()
  left_at: number;
}

export class OccupantLeftEventPayload {
  @Allow()
  room_jid: string;

  @Allow()
  is_breakout: boolean;

  @Allow()
  room_name: string;

  @Allow()
  event_name: string;

  @IsOptional()
  @Allow()
  breakout_room_id?: string;

  @Allow()
  @Type(() => Occupant)
  occupant: Occupant;
}
