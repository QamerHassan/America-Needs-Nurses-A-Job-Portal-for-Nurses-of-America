const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:8ETj7@Zv@localhost:5432/ANNdb?schema=public'
});
client.connect().then(async () => {
  try {
    // 1. Find the NEW Peterson logo
    const newPetersonRes = await client.query(`
      SELECT "imageUrl"
      FROM "Job"
      WHERE title ILIKE '%Travel nurse%'
      AND "imageUrl" IS NOT NULL
      ORDER BY "createdAt" DESC
      LIMIT 1
    `);
    const petersonLogo = newPetersonRes.rows[0]?.imageUrl;
    console.log('Found Peterson Logo:', petersonLogo);

    if (petersonLogo) {
      // 2. Update OLD Peterson and Northshore jobs
      const res = await client.query(`
        UPDATE "Job"
        SET "imageUrl" = $1
        WHERE "imageUrl" IS NULL
        AND ("location" ILIKE '%California%' OR "location" ILIKE '%Hawaii%' OR "location" ILIKE '%Alabama%')
      `, [petersonLogo]);
      console.log(`Updated ${res.rowCount} old jobs with the real logo.`);
    }

  } catch (e) {
    console.error(e);
  } finally {
    client.end();
  }
});
