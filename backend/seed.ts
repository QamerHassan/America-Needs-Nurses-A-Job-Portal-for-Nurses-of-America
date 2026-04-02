import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter } as any);


async function main() {
  // Create a placeholder user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@americaneednurses.com' },
    update: {},
    create: {
      email: 'admin@americaneednurses.com',
      name: 'ANN Admin',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });

  // Create a placeholder company
  await prisma.company.upsert({
    where: { slug: 'ann-recruiting' },
    update: {},
    create: {
      name: 'ANN Recruiting',
      slug: 'ann-recruiting',
      category: 'Recruitment Agency',
      description: 'The leading provider of high-quality nursing staffing solutions across the USA.',
      status: 'APPROVED',
      isFeatured: true,
      email: 'contact@americaneednurses.com',
      website: 'https://americaneednurses.com',
      ownerId: admin.id,
    },
  });

  console.log('Seed data inserted successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
