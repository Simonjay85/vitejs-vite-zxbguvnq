import { prisma } from '../server';
import { broadcastToEvent } from '../websockets/gateway';
import { AITools } from './AITools';

export class ScoreService {

  /**
   * Handles player or referee submitting a match score.
   */
  static async submitScore(matchId: string, submittedBy: string, score1: number, score2: number) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { teams: { include: { players: { include: { player: true } } } } }
    });

    if (!match) throw new Error("Match not found");

    // Persist score submission
    const submission = await prisma.scoreSubmission.create({
      data: { matchId, submittedBy, team1Score: score1, team2Score: score2, status: 'PENDING' }
    });

    // Broadcast live update if match is not finalized yet
    await broadcastToEvent(match.sessionId, 'score:live', {
      matchId,
      scores: { team1: score1, team2: score2 },
      submittedBy
    });

    // If game ends (Score limit reached)
    const isFinal = score1 >= 11 || score2 >= 11;
    if (isFinal) {
      await this.finalizeMatch(matchId, score1, score2);
    }

    return submission;
  }

  /**
   * Closes out match, executes ELO redistribution, completely frees court.
   */
  private static async finalizeMatch(matchId: string, score1: number, score2: number) {
    const match = await prisma.match.update({
      where: { id: matchId },
      data: { status: 'COMPLETED', endTime: new Date() },
      include: { 
        court: true, 
        teams: { include: { players: true } }
      }
    });

    // ELO Adjustments (Offloaded to AI Engine ruleset)
    await AITools.updateRatingProfiles(
      match.teams[0].players, 
      match.teams[1].players, 
      score1, score2
    );

    // Free the Court
    await prisma.court.update({
      where: { id: match.courtId },
      data: { isActive: true } // Reset to purely empty/active
    });

    // Final WebSocket State Broadcast
    await broadcastToEvent(match.sessionId, 'court:free', {
      courtId: match.courtId,
      matchId: match.id,
      finalScore: { team1: score1, team2: score2 }
    });
  }
}
