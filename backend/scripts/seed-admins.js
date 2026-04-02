const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const supportPassword = '12345678';
  const contentPassword = '87654321';

  // Upsert Support Admin
  const supportAdmin = await prisma.user.upsert({
    where: { email: 'supportadmin@ann.com' },
    update: {
      password: supportPassword,
      role: 'SUPPORT_ADMIN',
      status: 'ACTIVE',
      isOnboarded: true,
      name: 'Support Admin'
    },
    create: {
      email: 'supportadmin@ann.com',
      password: supportPassword,
      role: 'SUPPORT_ADMIN',
      status: 'ACTIVE',
      isOnboarded: true,
      name: 'Support Admin'
    }
  });

  // Upsert Content Admin
  const contentAdmin = await prisma.user.upsert({
    where: { email: 'contentadmin@ann.com' },
    update: {
      password: contentPassword,
      role: 'CONTENT_ADMIN',
      status: 'ACTIVE',
      isOnboarded: true,
      name: 'Content Admin'
    },
    create: {
      email: 'contentadmin@ann.com',
      password: contentPassword,
      role: 'CONTENT_ADMIN',
      status: 'ACTIVE',
      isOnboarded: true,
      name: 'Content Admin'
    }
  });

  console.log('Admins seeded successfully:', { supportAdmin: supportAdmin.email, contentAdmin: contentAdmin.email });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
