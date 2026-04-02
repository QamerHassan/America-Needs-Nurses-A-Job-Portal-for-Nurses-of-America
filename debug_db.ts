import { PrismaClient } from './backend/node_modules/@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    take: 5,
    include: {
      Company: true,
    }
  });
  console.log('Users:', JSON.stringify(users, null, 2));

  const companies = await prisma.company.findMany({
    take: 5
  });
  console.log('Companies:', JSON.stringify(companies, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
