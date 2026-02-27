import type { Participant } from './derby';

export interface RoomData {
  room_id: string;
  name: string;
  location: string;
  date: string;
  participants: Participant[];
  created_by: string;
  is_active: boolean;
  created_at: string;
}

export interface RoomCatchEvent {
  id: string;
  room_id: string;
  participant_id: string;
  delta: 1 | -1;
  client_id: string;
  created_at: string;
}
