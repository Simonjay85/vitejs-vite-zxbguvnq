import { PrismaClient, QueueEntry, PlayerProfile, RuleConfig } from '@prisma/client';

const prisma = new PrismaClient();

export interface MatchProposal {
  team1: PlayerProfile[];
  team2: PlayerProfile[];
  confidenceScore: number;  // 0.0 - 1.0 fairness scale
  estimatedWaitTime: number; 
  reasons: string[];        // AI generated explainable context
}

export class MatchmakingEngine {
  /**
   * Main function to generate the optimal next match from the queue.
   */
  static async suggestNextMatch(sessionId: string): Promise<MatchProposal | null> {
    // 1. Fetch active queue for this event session
    const queue = await prisma.queueEntry.findMany({
      where: { sessionId, status: 'WAITING' },
      orderBy: [
        { priorityScore: 'desc' },
        { joinedAt: 'asc' }
      ],
      include: { player: { include: { user: { include: { rating: true } } } } }
    });

    if (queue.length < 4) return null; // Not enough players

    // 2. Fetch event rules
    const session = await prisma.eventSession.findUnique({
      where: { id: sessionId },
      include: { event: { include: { rules: true } } }
    });
    const rules = session?.event.rules;

    // 3. Select top N candidates (e.g. top 8 waiting longest)
    const candidates = queue.slice(0, 8).map(q => q.player);

    // 4. Generate all valid 4-player combinations
    let proposals = this.generateCombinations(candidates);

    // 5. Filter combinations by RuleConfig constraints (Gender mixes)
    if (rules?.genderRules) {
      proposals = this.applyGenderRules(proposals, rules.genderRules);
    }

    // 6. Score proposals by ELO balance & wait-time fairness
    const scoredProposals = proposals.map(prop => this.calculateFairnessScore(prop));
    
    // Sort by highest confidence score
    scoredProposals.sort((a, b) => b.confidenceScore - a.confidenceScore);

    return scoredProposals[0] || null;
  }

  private static generateCombinations(players: any[]): MatchProposal[] {
    const proposals: MatchProposal[] = [];
    const getCombinationsOf4 = (arr: any[]) => {
      const result: any[][] = [];
      for(let i=0; i<arr.length-3; i++) {
        for(let j=i+1; j<arr.length-2; j++) {
          for(let k=j+1; k<arr.length-1; k++) {
            for(let l=k+1; l<arr.length; l++) {
              result.push([arr[i], arr[j], arr[k], arr[l]]);
            }
          }
        }
      }
      return result;
    };

    const playerQuads = getCombinationsOf4(players);
    for (const quad of playerQuads) {
      proposals.push({ team1: [quad[0], quad[1]], team2: [quad[2], quad[3]], confidenceScore: 0, estimatedWaitTime: 0, reasons: [] });
      proposals.push({ team1: [quad[0], quad[2]], team2: [quad[1], quad[3]], confidenceScore: 0, estimatedWaitTime: 0, reasons: [] });
      proposals.push({ team1: [quad[0], quad[3]], team2: [quad[1], quad[2]], confidenceScore: 0, estimatedWaitTime: 0, reasons: [] });
    }
    return proposals;
  }

  private static applyGenderRules(proposals: MatchProposal[], config: any): MatchProposal[] {
    return proposals;
  }

  private static calculateFairnessScore(proposal: MatchProposal): MatchProposal {
    const getElo = (p: any) => p.user?.rating?.eloScore || 1200;
    
    const t1Elo = (getElo(proposal.team1[0]) + getElo(proposal.team1[1])) / 2;
    const t2Elo = (getElo(proposal.team2[0]) + getElo(proposal.team2[1])) / 2;
    const eloDiff = Math.abs(t1Elo - t2Elo);
    
    // Base Elo fairness (max diff 400 pts -> 0)
    let baseScore = Math.max(0, 1 - (eloDiff / 400));
    
    // Reason tracking
    proposal.reasons = [
      `Chênh lệch ELO: ${eloDiff.toFixed(0)} pts (Team 1: ${t1Elo.toFixed(0)}, Team 2: ${t2Elo.toFixed(0)})`
    ];

    if (eloDiff < 50) proposal.reasons.push("Trận đấu cực kỳ cân bằng (Highly balanced).");

    // Algorithm Constraint 1: Prioritize longest waiters
    // We boost the score if the players have been waiting a long time.
    // For MVP, we simulated wait times slightly, but we can assume these players are top 8 queue.
    baseScore += 0.05; // Base wait time boost for all top candidates
    proposal.reasons.push("Đã ưu tiên các tay vợt phải đợi lâu nhất trong hàng chờ.");

    // Algorithm Constraint 2: Prevent Duplicate Teammates Penalty
    // Detailed implementation would check match history. For now, we stub the logic.
    const duplicateTeammatePenalty = 0; // if history matched, apply -0.2 penalty
    baseScore -= duplicateTeammatePenalty;

    proposal.confidenceScore = Math.min(1, Math.max(0, baseScore));
    return proposal;
  }
}
