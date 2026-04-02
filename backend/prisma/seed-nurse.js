const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'linda@ann.com';
  
  // 1. Create User
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: 'Linda D. Strong',
        role: 'NURSE',
        status: 'ACTIVE',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&h=256&auto=format&fit=crop',
        isOnboarded: true,
      },
    });
    console.log('Created User:', user.email);
  }

  // 2. Create Nurse Profile
  let profile = await prisma.nurseProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    profile = await prisma.nurseProfile.create({
      data: {
        userId: user.id,
        fullName: 'Linda D. Strong',
        phone: '123-456-7890',
        location: 'California, USA',
        specialization: 'ICU / Critical Care',
        yearsOfExperience: 5,
        bio: 'Dedicated ICU nurse with 5 years of experience in high-pressure environments.',
        employmentPref: ['Full-time', 'Travel'],
        skills: ['ICU', 'Critical Care', 'Patient Monitoring'],
      },
    });
    console.log('Created Nurse Profile');
  }

  // 3. Create mock notifications if none exists
  const notifCount = await prisma.notification.count({ where: { userId: user.id } });
  if (notifCount === 0) {
    await prisma.notification.createMany({
      data: [
        { userId: user.id, title: 'Message Reply', message: 'Kr. Shaury Preet replied your message', type: 'NEW_MESSAGE' },
        { userId: user.id, title: 'Application Accepted', message: 'Mortin Denver accepted your resume!', type: 'APPLICATION_UPDATE' },
        { userId: user.id, title: 'Job Alert', message: 'Your job #456256 expired yesterday', type: 'JOB_EXPIRED' },
      ],
    });
    console.log('Created initial notifications');
  }

  console.log('Seed completed successfully. User ID:', user.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
