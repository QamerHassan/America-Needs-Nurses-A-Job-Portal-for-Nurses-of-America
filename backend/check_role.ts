import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env from backend/.env
dotenv.config({ path: path.resolve(__dirname, '.env') });

const prisma = new PrismaClient();

async function check() {
  console.log('--- ADMIN USER CHECK ---');
  const user = await prisma.user.findFirst({
    where: { email: 'qamerhassan455@gmail.com' }
  });

  if (!user) {
    console.log('User qamerhassan455@gmail.com NOT FOUND');
    return;
  }

  console.log(`User found: ${user.email} | Role: ${user.role} | ID: ${user.id}`);

  console.log('--- CONTACT NOTIFICATIONS ---');
  const notifs = await prisma.notification.findMany({
    where: { type: 'CONTACT_SUBMISSION' as any },
    include: { User: { select: { email: true } } }
  });

  console.log(`Total CONTACT_SUBMISSION notifications: ${notifs.length}`);
  notifs.forEach(n => {
    console.log(`To: ${n.User.email} | Msg: ${n.message}`);
  });
}

check().catch(console.error).finally(() => prisma.$disconnect());
