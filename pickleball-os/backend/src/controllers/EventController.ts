import { Request, Response } from 'express';
import { prisma } from '../server';
import { broadcastEvent } from '../redis';

export class EventController {

  static async createEvent(req: Request, res: Response) {
    try {
      const { venueId, name, mode, startTime, pointLimit, genderRules } = req.body;
      
      const event = await prisma.event.create({
        data: {
          venueId,
          name,
          mode,
          startTime: new Date(startTime),
          rules: {
            create: { pointLimit, genderRules }
          }
        },
        include: { rules: true }
      });

      res.status(201).json(event);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async getActiveEvents(req: Request, res: Response) {
    try {
      const events = await prisma.event.findMany({
        where: { status: 'ACTIVE' },
        include: { venue: true }
      });
      res.json(events);
    } catch (err: any) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async startSession(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const session = await prisma.eventSession.create({
        data: { eventId, metadata: { startedAt: new Date().toISOString() } }
      });
      res.status(201).json(session);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
