import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding MVP data...');

  // Create a default venue
  const venue = await prisma.venue.create({
    data: { name: 'Main HQ', location: 'San Jose' }
  });

  // Create courts
  for (let i = 1; i <= 4; i++) {
    await prisma.court.create({
      data: { venueId: venue.id, name: `Court ${i}`, isActive: true }
    });
  }

  // Create an event and session
  const event = await prisma.event.create({
    data: { venueId: venue.id, name: 'MVP Night', mode: 'OPEN_PLAY', startTime: new Date() }
  });

  await prisma.eventSession.create({
    data: { id: 'SESSION_123', eventId: event.id }
  });

  // Create some users and profiles for matchmaking
  for (let i = 1; i <= 8; i++) {
    const user = await prisma.user.create({
      data: {
        authId: `test_auth_${i}`,
        profile: {
          create: { name: `Test Player ${i}`, gender: i % 2 === 0 ? 'F' : 'M' }
        },
        rating: {
          create: { skillLevel: '3.5', eloScore: 1200 + (Math.random() * 100) }
        }
      }
    });

    // Optionally join them to queue directly for testing
    const profile = await prisma.playerProfile.findUnique({ where: { userId: user.id } });
    if (profile) {
      await prisma.queueEntry.create({
        data: { sessionId: 'SESSION_123', playerId: profile.id, status: 'WAITING' }
      });
    }
  }

  console.log('Done seeding!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
