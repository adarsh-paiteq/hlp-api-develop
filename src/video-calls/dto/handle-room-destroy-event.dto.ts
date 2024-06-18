import { Type } from 'class-transformer';
import { Allow, IsOptional } from 'class-validator';

export class RoomDestroyedEventPayload {
  @Allow()
  event_name: string;

  @Allow()
  room_name: string;

  @Allow()
  room_jid: string;

  @Allow()
  is_breakout: boolean;

  @Allow()
  created_at: number;

  @Allow()
  destroyed_at: number;

  @Allow()
  @IsOptional()
  breakout_room_id?: string;

  @Allow()
  @Type(() => AllOccupant)
  all_occupants: AllOccupant[];
}

export class AllOccupant {
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
