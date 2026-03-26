import { z } from 'zod';

const API_BASE = 'http://localhost:5000/api';

/**
 * Tool 1: Check in to the active queue
 */
export const checkInQueueTool = {
  name: "check_in_queue",
  description: "Check a player into the live matchmaking queue.",
  parameters: z.object({
    playerId: z.string().describe("The Unique ID of the player sending the message."),
    eventId: z.string().describe("The ID of the active event/session (defaults to 'live' if unspecified).")
  }),
  execute: async (args: { playerId: string, eventId: string }) => {
    try {
      const act = await fetch(`${API_BASE}/queue/${args.eventId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerIds: [args.playerId] })
      });
      if (!act.ok) throw new Error("API rejected the check-in");
      return "Successfully checked in. Broadcasted to the Live Queue.";
    } catch (e: any) {
      return `Failed to check in: ${e.message}`;
    }
  }
};

/**
 * Tool 2: Report Match Score
 */
export const reportScoreTool = {
  name: "report_match_score",
  description: "Submits a final score for an ongoing match.",
  parameters: z.object({
    matchId: z.string().describe("The ID of the court/match being reported."),
    team1Score: z.number().describe("Score for Team 1 (usually the team communicating)."),
    team2Score: z.number().describe("Score for Team 2 (opponents).")
  }),
  execute: async (args: { matchId: string, team1Score: number, team2Score: number }) => {
    try {
      const act = await fetch(`${API_BASE}/matches/${args.matchId}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team1Score: args.team1Score, team2Score: args.team2Score })
      });
      return "Score submitted successfully. ELO update triggered.";
    } catch (e: any) {
      return `Failed to store score: ${e.message}`;
    }
  }
};

/**
 * Tool 3: Get Queue Status (Wait Time Estimate)
 */
export const getQueueStatusTool = {
  name: "get_queue_status",
  description: "Gets the estimated wait time remaining and number of players queued.",
  parameters: z.object({
    sessionId: z.string().describe("The ID of the active event/session (defaults to 'live' if unspecified).")
  }),
  execute: async (args: { sessionId: string }) => {
    try {
      // Calls our AITools Node.js controller
      const act = await fetch(`${API_BASE}/analytics/wait-times/${args.sessionId}`);
      const data = await act.json();
      return `There are currently ${data.queueLength} players ahead. The estimated wait time is ~${data.estimateWaitMinutes} minutes.`;
    } catch (e: any) {
      return `Failed to fetch status: ${e.message}`;
    }
  }
};
