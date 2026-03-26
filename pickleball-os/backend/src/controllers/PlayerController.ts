import { Request, Response } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth';
import { broadcastEvent } from '../redis';

export class PlayerController {

  static async createProfile(req: AuthRequest, res: Response) {
    try {
      // User ID comes from auth middleware
      const userId = req.user!.id;
      const { name, gender, bio, avatarUrl } = req.body;

      // Ensure user exists (Mock or create logic here if independent Auth provider is used)
      let user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
         user = await prisma.user.create({ data: { id: userId, authId: userId } });
      }

      const profile = await prisma.playerProfile.create({
        data: { userId, name, gender, bio, avatarUrl }
      });
      
      const rating = await prisma.ratingProfile.create({
        data: { userId, skillLevel: "3.0", eloScore: 1200.0 }
      });

      res.status(201).json({ profile, rating });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async checkInQueue(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id; // Authenticated user
      const { sessionId } = req.params;
      
      const profile = await prisma.playerProfile.findUnique({ where: { userId } });
      if (!profile) return res.status(404).json({ error: 'Profile not found' });

      // Add to DB Queue
      const entry = await prisma.queueEntry.create({
        data: {
          sessionId,
          playerIds: [profile.id]
        }
      });

      // Broadcast to Redis for Real-time update
      await broadcastEvent(sessionId, 'queue:update', {
        action: 'join',
        sessionId,
        players: [{ id: profile.id, name: profile.name, gender: profile.gender }],
        timestamp: Date.now()
      });

      res.status(200).json(entry);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
