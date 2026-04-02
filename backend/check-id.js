const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkId() {
  const id = '66d02246-2ffc-4b44-856f-ffccc9fbd1a0';
  console.log('Checking ID:', id);
  
  const user = await prisma.user.findUnique({ where: { id } });
  console.log('Found in User table:', user ? 'YES' : 'NO');
  
  const profile = await prisma.nurseProfile.findUnique({ where: { id } });
  console.log('Found in NurseProfile table (as ID):', profile ? 'YES' : 'NO');

  const profileByUserId = await prisma.nurseProfile.findUnique({ where: { userId: id } });
  console.log('Found in NurseProfile table (as userId):', profileByUserId ? 'YES' : 'NO');
  
  process.exit(0);
}

checkId();
