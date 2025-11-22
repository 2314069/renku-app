export interface Renku {
  _id: string;
  title: string;
  participants: Participant[];
  verses: Verse[];
  currentTurn: number;
  createdAt: string;
  updatedAt: string;
  completed: boolean;
}

export interface Participant {
  id: string;
  name: string;
  joinedAt: string;
  role?: 'admin' | 'participant';
}

export interface Verse {
  id: string;
  participantId: string;
  participantName: string;
  text: string;
  type: '575' | '77';
  order: number;
  createdAt: string;
  seasonWord?: string;
}




