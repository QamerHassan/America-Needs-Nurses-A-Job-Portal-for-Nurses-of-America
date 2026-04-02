import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '.env') });

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter } as any);

  try {
    const emailToFix = 'qamerhassan455@gmail.com';
    const alternativeEmail = 'qamerhassan445@gmail.com';

    // 1. Try to find/fix the 455 email
    let user = await prisma.user.findUnique({ where: { email: emailToFix } });
    
    if (!user) {
      console.log(`User ${emailToFix} not found. Checking ${alternativeEmail}...`);
      user = await prisma.user.findUnique({ where: { email: alternativeEmail } });
    }

    if (user) {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'SUPER_ADMIN' }
      });
      console.log('SUCCESS: User promoted to SUPER_ADMIN:', JSON.stringify({
        email: updated.email,
        role: updated.role
      }, null, 2));
    } else {
      console.log('ERROR: No user found to promote.');
    }

  } catch (err) {
    console.error('DATABASE_ERROR:', err);
  } finally {
    await pool.end();
  }
}

main();
