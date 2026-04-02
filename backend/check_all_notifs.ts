import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  console.log('--- SYSTEM WIDE NOTIFICATIONS ---');
  const allNotifs = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
        User: {
            select: { email: true, role: true }
        }
    }
  });

  if (allNotifs.length === 0) {
    console.log('No notifications found in the entire database.');
  } else {
    allNotifs.forEach(n => {
      console.log(`[${n.createdAt.toISOString()}] TO: ${n.User.email} (${n.User.role}) | TYPE: ${n.type} | MSG: ${n.message}`);
    });
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
