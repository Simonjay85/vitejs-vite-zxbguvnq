import { create } from 'zustand';
import { db, ref, onValue, set, get } from '../firebase';

export type EventPhase = 'idle' | 'checkin' | 'queue' | 'match_assigned' | 'playing';

export interface MatchData {
  courtId: string;
  courtName: string;
  team1: { id: string; name: string; elo: number }[];
  team2: { id: string; name: string; elo: number }[];
  fairness: number; // 0-100, e.g. 51 means team1 is 51% favorite
}

export interface PlayerState {
  id: string;
  name: string;
  elo: number;
  checkedIn: boolean;
  paid: boolean;
  viewerCode: string | null;
}

interface EventStoreState {
  // App state
  phase: EventPhase;
  setPhase: (p: EventPhase) => void;

  // Player profile (set on login)
  player: PlayerState | null;
  setPlayer: (p: PlayerState) => void;

  // Global event state from Firebase
  activeEventId: string | null;
  activeEvent: any | null;
  players: PlayerState[];
  courts: any[];
  queue: any[];
  announcement: string;

  // Match state
  myMatch: MatchData | null;
  queuePosition: number;
  estimatedWait: number; // minutes

  // Firebase subscription
  subscribeToEvent: () => () => void;
  checkIn: (code: string) => Promise<boolean>;
}

export const useEventStore = create<EventStoreState>((set, get) => ({
  phase: 'idle',
  setPhase: (p) => set({ phase: p }),

  player: null,
  setPlayer: (p) => set({ player: p, phase: p.checkedIn ? 'queue' : 'checkin' }),

  activeEventId: null,
  activeEvent: null,
  players: [],
  courts: [],
  queue: [],
  announcement: '',
  myMatch: null,
  queuePosition: 0,
  estimatedWait: 0,

  subscribeToEvent: () => {
    const stateRef = ref(db, 'state');
    const unsub = onValue(stateRef, (snap) => {
      const data = snap.val();
      if (!data) return;

      const players: PlayerState[] = Array.isArray(data.players)
        ? data.players
        : Object.values(data.players || {});
      const courts: any[] = Array.isArray(data.courts)
        ? data.courts
        : Object.values(data.courts || {});
      const queue: any[] = Array.isArray(data.queue) ? data.queue : [];

      set({
        activeEventId: data.activeEventId || null,
        activeEvent: data.events
          ? (Array.isArray(data.events) ? data.events : Object.values(data.events)).find(
              (e: any) => e.id === data.activeEventId
            ) || null
          : null,
        players,
        courts,
        queue,
        announcement: data.announcement || '',
      });

      // Check if the current player has been assigned to a court
      const myPlayer = get().player;
      if (!myPlayer) return;

      // Find if my player is in an active match
      let myMatch: MatchData | null = null;
      for (const c of courts) {
        if (!c.match) continue;
        const t1 = (c.match.team1 || []).filter(Boolean);
        const t2 = (c.match.team2 || []).filter(Boolean);
        const inMatch = [...t1, ...t2].some((p: any) => p.id === myPlayer.id);
        if (inMatch) {
          const t1elo = t1.reduce((s: number, p: any) => s + (p.elo || 1300), 0) / (t1.length || 1);
          const t2elo = t2.reduce((s: number, p: any) => s + (p.elo || 1300), 0) / (t2.length || 1);
          const total = t1elo + t2elo;
          myMatch = {
            courtId: c.id,
            courtName: c.name,
            team1: t1,
            team2: t2,
            fairness: total > 0 ? Math.round((t1elo / total) * 100) : 50,
          };
        }
      }

      if (myMatch && get().phase !== 'playing') {
        set({ myMatch, phase: 'match_assigned' });
      } else if (!myMatch && get().phase === 'match_assigned') {
        set({ myMatch: null, phase: 'queue' });
      }

      // Queue position
      const qi = queue.findIndex((q: any) => {
        const all = [...(q.team1 || []), ...(q.team2 || [])].filter(Boolean);
        return all.some((p: any) => p.id === myPlayer.id);
      });
      const liveCourts = courts.filter((c) => c.match).length;
      const avgMatchMin = 20;
      const estimated = qi >= 0 ? Math.ceil(((qi + 1) / Math.max(liveCourts, 1)) * avgMatchMin) : 0;
      set({ queuePosition: qi + 1, estimatedWait: estimated });

      // Update player data from Firebase
      const updated = players.find((p) => p.id === myPlayer.id);
      if (updated) {
        set((state) => ({ player: { ...state.player!, ...updated } }));
      }
    });

    return () => unsub();
  },

  checkIn: async (code: string) => {
    const { players } = get();
    const found = players.find(
      (p) => String(p.viewerCode) === String(code)
    );
    if (found) {
      set({ player: found, phase: 'queue' });
      return true;
    }
    return false;
  },
}));
