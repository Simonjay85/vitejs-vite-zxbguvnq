import { prisma } from '../server';
import { broadcastToEvent } from '../websockets/gateway';
import { MatchmakingEngine } from './MatchmakingEngine';
import { AITools } from './AITools';

export class QueueService {

  /**
   * Drops a player into the Active Waiting queue and triggers Matchmaker.
   */
  static async joinQueue(sessionId: string, playerIds: string[]) {
    // 1. Enter Queue
    const entry = await prisma.queueEntry.create({
      data: { sessionId, playerIds, status: 'WAITING' },
      include: { player: true } // Fetches the primary player data
    });

    // 2. Fetch entire Queue for broadcast
    const queue = await this.getActiveQueue(sessionId);
    
    // 3. AI estimates wait time for the newly joined player
    const waitTime = await AITools.estimateWaitTime(sessionId, queue.length);

    // 4. Fire WebSocket update
    await broadcastToEvent(sessionId, 'queue:update', {
      action: 'join',
      queueSnapshot: queue,
      estimatedWaitTime: waitTime
    });

    // 5. Trigger Matchmaking Background Check
    await MatchmakingEngine.suggestNextMatch(sessionId);

    return entry;
  }

  /**
   * Retrieves active players mapping their rating profiles for MM.
   */
  static async getActiveQueue(sessionId: string) {
    return prisma.queueEntry.findMany({
      where: { sessionId, status: 'WAITING' },
      orderBy: [ { priorityScore: 'desc' }, { joinedAt: 'asc' } ],
      include: { player: { include: { user: { include: { rating: true } } } } }
    });
  }

  /**
   * Player forces themselves out of queue (Resting, Bathroom)
   */
  static async leaveQueue(sessionId: string, entryId: string) {
    const entry = await prisma.queueEntry.update({
      where: { id: entryId },
      data: { status: 'LEFT' }
    });

    const queue = await this.getActiveQueue(sessionId);
    await broadcastToEvent(sessionId, 'queue:update', {
      action: 'leave',
      queueSnapshot: queue
    });

    return entry;
  }
}
