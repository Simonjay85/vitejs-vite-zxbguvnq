import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import * as dotenv from 'dotenv';
import apiRoutes from './api/routes';
import { redisClient } from './redis';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' } // Update in production to specific frontend URLs
});

export const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Main API Routes (Referencing the API scaffolding from Phase 1)
app.use('/api', apiRoutes);

// WebSocket Setup
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('join_event', (eventId) => {
    socket.join(`event:${eventId}`);
    console.log(`Socket ${socket.id} joined event ${eventId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Health check
app.get('/health', async (req, res) => {
  const dbStatus = await prisma.$queryRaw`SELECT 1`.catch(() => null);
  const redisStatus = redisClient.status === 'ready';
  res.json({
    status: dbStatus && redisStatus ? 'OK' : 'DEGRADED',
    services: { database: !!dbStatus, redis: redisStatus }
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Pickleball-OS Backend serving on port ${PORT}`);
});
