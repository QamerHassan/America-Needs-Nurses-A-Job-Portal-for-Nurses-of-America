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
    const adminAccounts = [
      { name: 'Qamer Hassan', email: 'qamerhassan455@gmail.com', role: 'SUPER_ADMIN', password: '8ETj7@Zv' },
      { name: 'Support Admin', email: 'supportadmin@ann.com', role: 'SUPPORT_ADMIN', password: '12345678' },
      { name: 'Content Admin', email: 'contentadmin@ann.com', role: 'CONTENT_ADMIN', password: '87654321' }
    ];

    console.log('--- PERMANENT ADMIN SETUP ---');

    // 1. Clean up old test admins (especially the 445 one)
    await prisma.user.deleteMany({
      where: { email: 'qamerhassan445@gmail.com' }
    });
    console.log('CLEANUP: Removed temporary admin account (445).');

    for (const admin of adminAccounts) {
      const existing = await prisma.user.findUnique({ where: { email: admin.email } });
      if (!existing) {
        await prisma.user.create({
          data: {
            name: admin.name,
            email: admin.email,
            password: admin.password,
            role: admin.role as any,
            status: 'ACTIVE'
          }
        });
        console.log(`CREATED: ${admin.email} (Role: ${admin.role})`);
      } else {
        await prisma.user.update({
          where: { id: existing.id },
          data: { 
            name: admin.name,
            password: admin.password,
            role: admin.role as any,
            status: 'ACTIVE'
          }
        });
        console.log(`UPDATED: ${admin.email} (Role: ${admin.role})`);
      }
    }

    console.log('--- SETUP COMPLETE ---');

  } catch (err) {
    console.error('DATABASE_ERROR:', err);
  } finally {
    await pool.end();
  }
}

main();
