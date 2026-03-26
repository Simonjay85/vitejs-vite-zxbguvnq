import { prisma } from '../server';
import { broadcastToEvent } from '../websockets/gateway';

/**
 * King of the Court Mode Logic
 * 
 * Rules:
 * - Court 1 is the "King Court". Winner stays. Losers go to bottom of queue.
 * - All other courts rotate normally.
 */
export class KingOfCourtEngine {

  /**
   * Call after a match is completed.
   * team1Won: true if team1 won, false if team2 won.
   */
  static async handleMatchResult(matchId: string, team1Won: boolean) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        court: true,
        teams: { include: { players: { include: { player: true } } } },
        session: true
      }
    });

    if (!match) return;

    const isKingCourt = match.court.name === 'Court 1';
    const sessionId = match.sessionId;

    const winningTeam = match.teams.find(t => team1Won ? t.teamIndex === 1 : t.teamIndex === 2);
    const losingTeam  = match.teams.find(t => team1Won ? t.teamIndex === 2 : t.teamIndex === 1);

    if (!winningTeam || !losingTeam) return;

    const winnerPlayerIds = winningTeam.players.map(p => p.playerId);
    const loserPlayerIds  = losingTeam.players.map(p => p.playerId);

    if (isKingCourt) {
      // Winners STAY on court 1 - mark them as PLAYING but don't add to queue
      // Losers go to back of queue
      for (const playerId of loserPlayerIds) {
        await prisma.queueEntry.create({
          data: { sessionId, playerId, status: 'WAITING', priorityScore: 0 }
        });
      }
      // Winners remain "PLAYING" status already - no change needed
      console.log(`👑 King of the Court: Winners stay! Losers rotated to end of queue.`);
    } else {
      // Normal courts: everyone goes to the bottom of the queue
      const allIds = [...winnerPlayerIds, ...loserPlayerIds];
      for (const playerId of allIds) {
        await prisma.queueEntry.create({
          data: {
            sessionId,
            playerId,
            status: 'WAITING',
            priorityScore: team1Won && winnerPlayerIds.includes(playerId) ? 1 : 0 // Winners get slight priority
          }
        });
      }
    }

    // Mark match as completed
    await prisma.match.update({ where: { id: matchId }, data: { status: 'COMPLETED', endTime: new Date() } });

    // Broadcast queue update
    const updatedQueue = await prisma.queueEntry.findMany({
      where: { sessionId, status: 'WAITING' },
      orderBy: [{ priorityScore: 'desc' }, { joinedAt: 'asc' }],
      include: { player: true }
    });
    await broadcastToEvent(sessionId, 'queue:update', { action: 'match_end', queueSnapshot: updatedQueue });
  }
}
