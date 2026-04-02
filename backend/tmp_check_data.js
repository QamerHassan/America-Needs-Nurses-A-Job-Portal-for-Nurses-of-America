const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const targetUserId = 'e53abc16-9055-466d-8824-f041cdd7cb23';
  console.log('--- DEBUG FOR USER: ' + targetUserId + ' ---');
  
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: { EmployerProfile: true }
  });
  
  if (!user) {
    console.log('❌ USER NOT FOUND IN DATABASE');
  } else {
    console.log('✅ USER FOUND:', user.name, '(' + user.role + ')');
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: targetUserId },
    include: { SubscriptionPlan: true },
    orderBy: { createdAt: 'desc' }
  });

  console.log('--- SUBSCRIPTIONS (' + subscriptions.length + ') ---');
  subscriptions.forEach((s, i) => {
    console.log(i + 1 + '. ID: ' + s.id + ', Plan: ' + (s.SubscriptionPlan?.name || 'N/A') + ', Status: ' + s.status + ', Created: ' + s.createdAt);
  });

  const transactions = await prisma.paymentTransaction.findMany({
    where: { Subscription: { userId: targetUserId } },
    orderBy: { createdAt: 'desc' }
  });

  console.log('--- TRANSACTIONS (' + transactions.length + ') ---');
  transactions.forEach((t, i) => {
    console.log(i + 1 + '. ID: ' + t.id + ', Status: ' + t.status + ', Method: ' + t.paymentMethod);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
