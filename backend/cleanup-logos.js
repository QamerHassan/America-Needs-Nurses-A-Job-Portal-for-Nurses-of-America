const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:8ETj7@Zv@localhost:5432/ANNdb?schema=public'
});
client.connect().then(async () => {
  try {
    // 1. Revert Northshore and USA Health (wrong logo)
    const revertRes = await client.query(`
      UPDATE "Job"
      SET "imageUrl" = NULL
      WHERE "companyId" IN (
        SELECT id FROM "Company" 
        WHERE name ILIKE '%Northshore%' 
        OR name ILIKE '%USA HEALTH%'
      )
    `);
    console.log(`Reverted ${revertRes.rowCount} jobs back to default initials.`);

    // 2. Identify the Peterson Logo and apply it ONLY to Peterson jobs
    const petersonRes = await client.query(`
      SELECT "imageUrl" FROM "Job" 
      WHERE "title" ILIKE '%Travel nurse%' 
      AND "imageUrl" IS NOT NULL 
      ORDER BY "createdAt" DESC LIMIT 1
    `);
    const correctLogo = petersonRes.rows[0]?.imageUrl;

    if (correctLogo) {
      const updatePeterson = await client.query(`
        UPDATE "Job"
        SET "imageUrl" = $1
        WHERE "companyId" IN (SELECT id FROM "Company" WHERE name ILIKE '%Peterson%')
      `, [correctLogo]);
      console.log(`Correctly applied Peterson logo to ${updatePeterson.rowCount} Peterson jobs.`);
    }

  } catch (e) {
    console.error(e);
  } finally {
    client.end();
  }
});
