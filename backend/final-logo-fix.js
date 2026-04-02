const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:8ETj7@Zv@localhost:5432/ANNdb?schema=public'
});
client.connect().then(async () => {
  try {
    const northshoreLogo = 'http://localhost:3001/uploads/e381f95a-f030-43ae-8483-62bca6fc35cc.jpg';
    const petersonLogo = 'http://localhost:3001/uploads/97c6dfda-9af5-4a04-a771-e252a6b488c0.jpg';

    // 1. Correct Northshore jobs
    const northRes = await client.query(`
      UPDATE "Job"
      SET "imageUrl" = $1
      WHERE "companyId" IN (SELECT id FROM "Company" WHERE name ILIKE '%Northshore%')
    `, [northshoreLogo]);
    console.log(`Updated ${northRes.rowCount} Northshore jobs with the correct blue logo.`);

    // 2. Correct Peterson jobs
    const peterRes = await client.query(`
      UPDATE "Job"
      SET "imageUrl" = $1
      WHERE "companyId" IN (SELECT id FROM "Company" WHERE name ILIKE '%Peterson%')
    `, [petersonLogo]);
    console.log(`Updated ${peterRes.rowCount} Peterson jobs with the real branding logo.`);

  } catch (e) {
    console.error(e);
  } finally {
    client.end();
  }
});
