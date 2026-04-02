const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:8ETj7@Zv@localhost:5432/ANNdb?schema=public'
});
client.connect().then(async () => {
  try {
    const res = await client.query(`
      SELECT 
        j.id, j.title, j."imageUrl", j."bannerUrl", c.name as company_name, j."createdAt"
      FROM "Job" j
      JOIN "Company" c ON j."companyId" = c.id
      ORDER BY j."createdAt" DESC
      LIMIT 20
    `);
    console.log('ALL RECENT JOBS AND IMAGES:');
    console.table(res.rows);

  } catch (e) {
    console.error(e);
  } finally {
    client.end();
  }
});
