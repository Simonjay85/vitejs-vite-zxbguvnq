import { Server, Socket } from 'socket.io';
import { redisClient } from '../redis';

let ioInstance: Server;

export function initializeWebSockets(io: Server) {
  ioInstance = io;

  // Subscribe to Redis Pub/Sub events dynamically
  redisClient.psubscribe('event:*', (err, count) => {
    if (err) console.error('Failed to subscribe to Redis:', err);
    console.log(`Subscribed to ${count} Redis channels for WebSockets`);
  });

  // Whenever a Redis pub/sub message arrives, broadcast it down to the targeted Socket.IO room
  redisClient.on('pmessage', (pattern, channel, message) => {
    // pattern = "event:*"
    // channel = "event:12345"
    try {
      const payload = JSON.parse(message);
      // emit to specific event room (e.g. room "event:12345")
      ioInstance.to(channel).emit(payload.topic, payload.data);
    } catch (e) {
      console.error('Failed to parse realtime message', e);
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`📡 Socket connected: ${socket.id}`);

    // Client explicitly joins an event lobby
    socket.on('join_event', (eventId: string) => {
      const room = `event:${eventId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined ${room}`);
      
      // Emit the initial state to the joining user immediately
      sendInitialState(socket, eventId);
    });

    socket.on('leave_event', (eventId: string) => {
      socket.leave(`event:${eventId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

/**
 * Sends the current Redis-cached state for Queues, Courts, and Leaderboard
 * upon initialization to avoid wait times for the next broadcast.
 */
async function sendInitialState(socket: Socket, eventId: string) {
  const stateHash = await redisClient.hgetall(`event_state:${eventId}`);
  for (const [topic, payloadStr] of Object.entries(stateHash)) {
    try {
      socket.emit(topic, JSON.parse(payloadStr));
    } catch (e) {}
  }
}

/**
 * Programmatic internal broadcast function to wrap Redis pub/sub logic.
 */
export async function broadcastToEvent(eventId: string, topic: string, data: any) {
  const payload = { topic, data, timestamp: Date.now() };
  
  // Cache the latest state
  await redisClient.hset(`event_state:${eventId}`, topic, JSON.stringify(data));
  // Broadcast to all nodes
  await redisClient.publish(`event:${eventId}`, JSON.stringify(payload));
}
