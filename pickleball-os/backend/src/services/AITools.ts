import { prisma } from '../server';

export class AITools {

  /**
   * Predictive Wait Time Module
   * Uses recent average game duration and queue depth for accurate wait estimation.
   */
  static async estimateWaitTime(sessionId: string, currentQueueLength: number): Promise<number> {
    // Look up recent 5 matches in this session
    const recentMatches = await prisma.match.findMany({
      where: { sessionId, status: 'COMPLETED' },
      orderBy: { endTime: 'desc' },
      take: 5
    });

    // Default to 15 mins if not enough data
    const AVG_MATCH_MINUTES = recentMatches.length > 0 
      ? recentMatches.reduce((acc, m) => acc + ((m.endTime!.getTime() - m.startTime.getTime()) / 60000), 0) / recentMatches.length
      : 15;

    const activeCourts = await prisma.court.count({ where: { isActive: true } });
    if (activeCourts === 0) return AVG_MATCH_MINUTES;

    // Little's Law variation for queue wait time prediction
    const cycleTimePerCourt = AVG_MATCH_MINUTES / activeCourts;
    const baseWait = currentQueueLength * cycleTimePerCourt;
    
    // Add 10% buffering for slow transitions
    return Math.ceil(baseWait * 1.1);
  }

  /**
   * Generates a Strava-style "Post Match Recap" using LLMs (Stub)
   * Converts score matrix to human-readable hype text for the Social Feed.
   */
  static async generateLeaderboardRecap(sessionId: string): Promise<string> {
    const prompt = `Analyze today's pickleball session scores. Highlight upsets, winning streaks, and funny trends.`;
    // const response = await openai.createCompletion({ prompt });
    return "What a session! Dave went undefeated (5-0), while Sarah had the biggest ELO jump of +45 with her killer baseline drives!";
  }

  /**
   * Post-Match ELO adjustment engine.
   * Based on Glicko-2 rating adjustment algorithm principles.
   */
  static async updateRatingProfiles(team1Players: any[], team2Players: any[], score1: number, score2: number) {
    const K_FACTOR = 32;
    const team1Win = score1 > score2;
    const team2Win = score2 > score1;

    // Calculate Team ELO Averages
    const t1Avg = team1Players.reduce((a, p) => a + p.player.user.rating.eloScore, 0) / (team1Players.length || 1);
    const t2Avg = team2Players.reduce((a, p) => a + p.player.user.rating.eloScore, 0) / (team2Players.length || 1);

    // Probability of Team 1 winning
    const expectedT1 = 1 / (1 + Math.pow(10, (t2Avg - t1Avg) / 400));
    const expectedT2 = 1 - expectedT1;

    // Actual outcomes (0 or 1)
    const actualT1 = team1Win ? 1 : (team2Win ? 0 : 0.5);
    const actualT2 = team2Win ? 1 : (team1Win ? 0 : 0.5);

    // ELO Diff
    const deltaT1 = K_FACTOR * (actualT1 - expectedT1);
    const deltaT2 = K_FACTOR * (actualT2 - expectedT2);

    // Update each player parallel
    for (const matchPlayer of team1Players) {
      await prisma.ratingProfile.update({
        where: { userId: matchPlayer.player.userId },
        data: { eloScore: { increment: deltaT1 } }
      });
      // Store performance delta to MatchPlayer audit record
      await prisma.matchPlayer.update({
        where: { id: matchPlayer.id },
        data: { performanceDelta: deltaT1 }
      });
    }

    for (const matchPlayer of team2Players) {
      await prisma.ratingProfile.update({
        where: { userId: matchPlayer.player.userId },
        data: { eloScore: { increment: deltaT2 } }
      });
      await prisma.matchPlayer.update({
        where: { id: matchPlayer.id },
        data: { performanceDelta: deltaT2 }
      });
    }
  }
}
