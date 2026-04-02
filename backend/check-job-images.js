const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:8ETj7@Zv@localhost:5432/ANNdb?schema=public'
});
client.connect().then(async () => {
  try {
    const res = await client.query(`
      SELECT 
        j.id,
        j.title, 
        j."imageUrl", 
        j."bannerUrl", 
        c.name as company_name,
        c."logoUrl" as company_logo
      FROM "Job" j 
      JOIN "Company" c ON j."companyId" = c.id 
      WHERE c.name ILIKE '%Peterson%' OR c.name ILIKE '%Northshore%'
    `);
    console.log('JOB IMAGERY DATA:');
    console.table(res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    client.end();
  }
});
