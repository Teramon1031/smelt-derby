export interface Participant {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface CatchEntry {
  id: string;
  participantId: string;
  count: number;
  timestamp: number;
}

export interface Derby {
  id: string;
  name: string;
  date: string;
  location: string;
  participants: Participant[];
  catches: CatchEntry[];
  isActive: boolean;
  createdAt: number;
}

export interface ParticipantRanking {
  participant: Participant;
  totalCatch: number;
  rank: number;
  catchEntries: CatchEntry[];
}
