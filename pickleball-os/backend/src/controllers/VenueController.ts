import { Request, Response } from 'express';
import { prisma } from '../server';

export class VenueController {

  static async createVenue(req: Request, res: Response) {
    try {
      const { name, location, configJson } = req.body;
      const venue = await prisma.venue.create({
        data: { name, location, configJson }
      });
      res.status(201).json(venue);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async getVenues(req: Request, res: Response) {
    try {
      const venues = await prisma.venue.findMany({
        include: { courts: true }
      });
      res.json(venues);
    } catch (err: any) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async addCourt(req: Request, res: Response) {
    try {
      const { venueId } = req.params;
      const { name } = req.body;
      const court = await prisma.court.create({
        data: { venueId, name }
      });
      res.status(201).json(court);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
