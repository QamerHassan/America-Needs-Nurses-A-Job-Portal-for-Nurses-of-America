import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const userId = '326685df-c22a-48d4-b988-c7e653263e85';
  console.log("Checking user...");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  console.log("User:", user?.name, user?.email);
  
  console.log("Checking subscriptions for user...");
  const subs = await prisma.subscription.findMany({ where: { userId } });
  console.log("Subscriptions Found:", subs.length);
  if (subs.length > 0) {
    console.log(subs);
  } else {
    console.log("No subscriptions found in the DB. This means the frontend request to 'manual-initiate' either failed silently or was never made.");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
