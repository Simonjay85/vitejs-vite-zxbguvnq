import { Router } from 'express';
import { prisma } from '../server';
import { QueueService } from '../services/QueueService';
import { MatchmakingEngine } from '../services/MatchmakingEngine';
import { KingOfCourtEngine } from '../services/KingOfCourtEngine';

const router = Router();

// --- Auth & RBAC ---
router.post('/auth/login', (req, res) => { /* JWT generation & Firebase verify */ });
router.get('/auth/me', (req, res) => { /* Return user + RBAC scope */ });

// --- Player App Endpoints ---
router.post('/events/:eventId/checkin', (req, res) => {
  // Verifies QR code / GPS radius, adds to EventSession, initiates initial QueueEntry
});

router.get('/players/:playerId/stats', (req, res) => {
  // Returns match history, current ELO, recent badges (integration w/ Social Service)
});

router.post('/queue/:sessionId/join', async (req, res) => {
  try {
    const { playerIds } = req.body;
    const entry = await QueueService.joinQueue(req.params.sessionId, playerIds);
    res.json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.post('/matches/:matchId/score', async (req, res) => {
  try {
    const { team1Score, team2Score, submittedBy } = req.body;
    const submission = await prisma.scoreSubmission.create({
      data: {
        matchId: req.params.matchId,
        submittedBy,
        team1Score,
        team2Score,
        status: 'PENDING'
      }
    });
    // Can also auto-resolve MVP-style
    await prisma.match.update({
      where: { id: req.params.matchId },
      data: { status: 'COMPLETED', endTime: new Date() }
    });
    res.json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// --- Admin Operations (Protected Routes) ---
router.post('/admin/events', (req, res) => {
  // Scaffolds new Event, EventSession, attaches RuleConfig
});

router.get('/admin/events/:eventId/live-status', (req, res) => {
  // Aggregates Redis Queue length, Postgres active matches, returns overview payload
});

router.get('/admin/matches/suggest/:sessionId', async (req, res) => {
  try {
    const proposal = await MatchmakingEngine.suggestNextMatch(req.params.sessionId);
    res.json({ success: true, proposal });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.post('/admin/matches/approve-suggestion', async (req, res) => {
  try {
    const { sessionId, team1PlayerIds, team2PlayerIds, courtId } = req.body;
    
    // Find an available court if not provided
    let assignedCourtId = courtId;
    if (!assignedCourtId) {
      const courts = await prisma.court.findMany({ where: { isActive: true } });
      // Stub: just pick the first active court for MVP
      if (courts.length > 0) assignedCourtId = courts[0].id;
      else return res.status(400).json({ error: "No active courts available" });
    }

    const match = await prisma.match.create({
       data: {
         sessionId,
         courtId: assignedCourtId,
         status: 'ONGOING',
         teams: {
           create: [
             { teamIndex: 1, players: { create: team1PlayerIds.map((id: string) => ({ playerId: id })) } },
             { teamIndex: 2, players: { create: team2PlayerIds.map((id: string) => ({ playerId: id })) } }
           ]
         }
       }
    });

    const allIds = [...team1PlayerIds, ...team2PlayerIds];
    await prisma.queueEntry.updateMany({
      where: { sessionId, playerId: { in: allIds }, status: 'WAITING' },
      data: { status: 'PLAYING' }
    });

    res.json({ success: true, match });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.post('/admin/disputes/:matchId/resolve', (req, res) => {
  // Accepts admin adjudication on conflicted ScoreSubmissions, finalizes ELO transaction
});

// --- King of the Court ---
router.post('/admin/matches/:matchId/king-result', async (req, res) => {
  try {
    const { team1Won } = req.body;
    await KingOfCourtEngine.handleMatchResult(req.params.matchId, team1Won);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// --- QR Check-in ---
// Expects: { sessionId, playerName, skillLevel, gender }
router.post('/checkin/qr', async (req, res) => {
  try {
    const { sessionId, playerName, skillLevel, gender } = req.body;

    // 1. Find or create the user/profile (simplified: by name for MVP)
    let profile = await prisma.playerProfile.findFirst({ where: { name: playerName } });
    if (!profile) {
      const user = await prisma.user.create({
        data: {
          authId: `qr_${Date.now()}`,
          profile: { create: { name: playerName, gender: gender || 'M' } },
          rating: { create: { skillLevel: skillLevel || '3.0', eloScore: 1200 } }
        },
        include: { profile: true }
      });
      profile = user.profile!;
    }

    // 2. Add to queue if not already waiting
    const existing = await prisma.queueEntry.findFirst({
      where: { sessionId, playerId: profile.id, status: 'WAITING' }
    });
    if (existing) return res.json({ success: true, message: 'Already in queue', profile });

    const entry = await QueueService.joinQueue(sessionId, [profile.id]);
    res.json({ success: true, profile, entry });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// --- AI & Analytics ---
router.get('/analytics/wait-times/:sessionId', (req, res) => {
  // Returns AI smoothed P90 / P50 wait times for the specific event
});

router.get('/analytics/fairness-report', (req, res) => {
  // Aggregates standard deviation of ELO deltas over a given time period
});

export default router;
