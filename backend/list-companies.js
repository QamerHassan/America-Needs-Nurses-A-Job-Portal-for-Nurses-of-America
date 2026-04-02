const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const companies = await prisma.company.findMany({ select: { id: true, name: true } });
  console.log(JSON.stringify(companies));
}

main().catch(console.error).finally(() => prisma.$disconnect());
