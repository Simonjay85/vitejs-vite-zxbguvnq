export interface QueueEvent {
  action: 'join' | 'leave' | 'bump';
  sessionId: string;
  players: {
    id: string;
    skill: number;
    gender: 'M' | 'F';
  }[];
  timestamp: number;
}

export interface CourtAssignEvent {
  courtId: string;
  matchId: string;
  team1: { id: string; name: string; avatarUrl: string }[];
  team2: { id: string; name: string; avatarUrl: string }[];
  predictedQuality: number; // 0-100 indicating fairness
}

export interface ScoreLiveEvent {
  matchId: string;
  courtId: string;
  currentScore: { team1: number; team2: number };
  isFinal: boolean;
}

export interface AdminOverrideEvent {
  target: 'match' | 'queue';
  id: string; // matchId or queueEntryId
  action: 'cancel' | 'expedite' | 'swap_player';
  metadata: Record<string, any>;
  reason: string;
}

/**
 * Socket.IO / Redis PubSub Contract:
 * 
 * Topics/Rooms:
 * - `event:{sessionId}:queue` -> Subscribed by Player App (Queue tab) and Admin Dashboard (Live Queue)
 * - `event:{sessionId}:courts` -> Subscribed by Player App (Courts tab) and Admin Dashboard (Active Courts)
 * - `event:{sessionId}:leaderboard` -> Real-time ELO updates
 */
