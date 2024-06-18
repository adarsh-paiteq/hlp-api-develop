import { Allow, IsOptional } from 'class-validator';

export class RoomCreatedEventPayload {
  @Allow()
  room_jid: string;

  @Allow()
  is_breakout: boolean;

  @Allow()
  created_at: number;

  @Allow()
  room_name: string;

  @Allow()
  event_name: string;

  @Allow()
  @IsOptional()
  breakout_room_id?: string;
}
