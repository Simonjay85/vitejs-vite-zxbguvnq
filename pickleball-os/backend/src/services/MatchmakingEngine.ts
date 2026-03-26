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
      include: { player: true }
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

  private static generateCombinations(players: PlayerProfile[]): MatchProposal[] {
    // Stub: Returns raw permutations of size 4
    return [];
  }

  private static applyGenderRules(proposals: MatchProposal[], config: any): MatchProposal[] {
    // Stub: Filter by "mixed doubles only", etc.
    return proposals;
  }

  private static calculateFairnessScore(proposal: MatchProposal): MatchProposal {
    // Stub: 
    // 1. Look up ELO scores for Team1 vs Team2
    // 2. Check MatchHistory to dock points if these players played together recently
    // 3. Check wait times (boost confidence if longest-waiting players are included)
    proposal.confidenceScore = 0.85;
    proposal.reasons = [
      "ELO difference is only 30 pts (Highly balanced)",
      "Includes longest waiting player (Sarah)",
      "These 4 have not played together today"
    ];
    return proposal;
  }
}
