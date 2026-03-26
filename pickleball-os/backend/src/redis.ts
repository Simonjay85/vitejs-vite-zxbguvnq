import Redis from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config();

// Default to local redis if no URL provided
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = new Redis(redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 3
});

redisClient.on('error', (err) => {
  console.error('Redis Connection Error:', err);
});

redisClient.on('connect', () => {
  console.log('🔗 Successfully connected to Redis');
});

/**
 * Convenience method to publish Realtime Events to Socket.IO instances
 */
export async function broadcastEvent(eventId: string, topic: string, payload: any) {
  // Store latest state in Redis list/hash
  await redisClient.hset(`event_state:${eventId}`, topic, JSON.stringify(payload));
  
  // Publish to pub/sub
  await redisClient.publish(`event:${eventId}`, JSON.stringify({ topic, payload }));
}
