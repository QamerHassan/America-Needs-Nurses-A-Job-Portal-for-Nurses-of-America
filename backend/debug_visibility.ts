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
    const jobs = await prisma.job.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { Company: true }
    });
    
    console.log('--- RECENT JOBS ---');
    console.log(JSON.stringify(jobs.map(j => ({
      id: j.id,
      title: j.title,
      postedById: j.postedById,
      companyId: j.companyId,
      companyOwnerId: j.Company?.ownerId,
      status: j.status
    })), null, 2));

    const companies = await prisma.company.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    });
    console.log('--- RECENT COMPANIES ---');
    console.log(JSON.stringify(companies.map(c => ({
        id: c.id,
        name: c.name,
        ownerId: c.ownerId
    })), null, 2));

  } catch (err) {
    console.error('DATABASE_ERROR:', err);
  } finally {
    await pool.end();
  }
}

main();
