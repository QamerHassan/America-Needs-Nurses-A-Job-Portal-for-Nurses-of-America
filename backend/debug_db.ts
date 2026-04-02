import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter } as any);

  console.log("Checking ALL Jobs in DB...");
  
  try {
    const totalJobs = await prisma.job.count();
    console.log(`Total Jobs Count: ${totalJobs}`);

    const latestJobs = await prisma.job.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: { 
        id: true, 
        title: true, 
        status: true, 
        createdAt: true, 
        postedById: true,
        companyId: true 
      }
    });
    console.log('Latest 20 Jobs:', JSON.stringify(latestJobs, null, 2));

  } catch (e: any) {
    console.error("FAILURE:", e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
