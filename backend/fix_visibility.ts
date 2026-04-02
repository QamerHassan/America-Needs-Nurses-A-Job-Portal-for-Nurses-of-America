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
    const adminEmail = 'qamerhassan455@gmail.com';
    const user = await prisma.user.findUnique({ where: { email: adminEmail } });
    
    if (user) {
        console.log('USER_ID_FOUND:', user.id);
        
        // Let's see if this ID matches any companies or jobs
        const companiesCount = await prisma.company.count({ where: { ownerId: user.id } });
        const jobsCount = await prisma.job.count({ where: { postedById: user.id } });
        
        console.log(`Current ${adminEmail} owns: ${companiesCount} companies and ${jobsCount} jobs.`);
        
        if (companiesCount === 0 || jobsCount === 0) {
            console.log('REASON: The user is logged in with a new account that does not own the previously created companies/jobs.');
            
            // Fix: Transfer ownership of the "USA HEALTH" companies to this user
            const lastCompany = await prisma.company.findFirst({
                where: { name: 'USA HEALTH', ownerId: { not: user.id } },
                orderBy: { createdAt: 'desc' }
            });

            if (lastCompany) {
                console.log(`FIXING: Transferring company ${lastCompany.id} to ${user.id}`);
                await prisma.company.update({
                    where: { id: lastCompany.id },
                    data: { ownerId: user.id }
                });
                
                await prisma.job.updateMany({
                   where: { companyId: lastCompany.id },
                   data: { postedById: user.id }
                });
                console.log('SUCCESS: Ownership transferred.');
            }
        }
    } else {
        console.log('User not found.');
    }

  } catch (err) {
    console.error('DATABASE_ERROR:', err);
  } finally {
    await pool.end();
  }
}

main();
