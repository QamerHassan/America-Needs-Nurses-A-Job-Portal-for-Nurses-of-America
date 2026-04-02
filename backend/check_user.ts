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
    const adminRoles = ['SUPER_ADMIN', 'CONTENT_ADMIN', 'SUPPORT_ADMIN', 'ADMIN'];
    const admins = await prisma.user.findMany({
      where: { role: { in: adminRoles as any } }
    });
    
    console.log('ADMIN_COUNT:', admins.length);
    console.log('ADMINS:', JSON.stringify(admins.map(u => ({ email: u.email, role: u.role })), null, 2));

    const check455 = await prisma.user.findFirst({
        where: { email: 'qamerhassan455@gmail.com' }
    });
    console.log('CHECK_455:', !!check455);

  } catch (err) {
    console.error('DATABASE_ERROR:', err);
  } finally {
    await pool.end();
  }
}

main();
