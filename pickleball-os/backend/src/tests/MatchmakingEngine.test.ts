import { MatchmakingEngine } from '../services/MatchmakingEngine';
import { QueueService } from '../services/QueueService';

describe('MatchmakingEngine & Queue Integration', () => {

  const mockSessionId = 'evt-live-123';

  beforeAll(async () => {
    // Seed DB with mock players: 4 men, 4 women with specific ELOs
  });

  afterAll(async () => {
    // Cleanup DB Sandbox
  });

  it('should successfully pair 4 waiting players together based on wait time', async () => {
    await QueueService.joinQueue(mockSessionId, ['player-1']);
    await QueueService.joinQueue(mockSessionId, ['player-2']);
    await QueueService.joinQueue(mockSessionId, ['player-3']);
    await QueueService.joinQueue(mockSessionId, ['player-4']);

    const proposal = await MatchmakingEngine.suggestNextMatch(mockSessionId);
    
    expect(proposal).toBeDefined();
    expect(proposal?.team1.length).toBe(2);
    expect(proposal?.team2.length).toBe(2);
    expect(proposal?.confidenceScore).toBeGreaterThan(0);
  });

  it('should respect Gender Mixing configurations (RuleConfig)', async () => {
    // Apply "Mixed Doubles Only" rule config
    // Add 2 men and 2 women
    // Suggest Match
    // Expect Team A: 1 Man, 1 Woman. Team B: 1 Man, 1 Woman.
  });

  it('should minimize ELO delta in proposed matches', async () => {
    // Add [ELO 1000, 1500, 1000, 1500]
    // Suggest Match -> Should ideally pair [1000, 1500] vs [1000, 1500]
  });
});
