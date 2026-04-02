const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:8ETj7@Zv@localhost:5432/ANNdb?schema=public'
});
client.connect().then(async () => {
  try {
    const res = await client.query(`
      SELECT 
        j.id, j.title, j."imageUrl", j."bannerUrl", c.name as company_name
      FROM "Job" j
      JOIN "Company" c ON j."companyId" = c.id
      WHERE c.name ILIKE '%Peterson%' OR c.name ILIKE '%Northshore%'
    `);
    console.log('CURRENT JOB IMAGERY DATA:');
    console.table(res.rows);

    const imagesRes = await client.query(`
      SELECT ci.url, ci."companyId", c.name
      FROM "CompanyImage" ci
      JOIN "Company" c ON ci."companyId" = c.id
      WHERE c.name ILIKE '%Peterson%' OR c.name ILIKE '%Northshore%'
    `);
    console.log('COMPANY GALLERY IMAGES:');
    console.table(imagesRes.rows);

  } catch (e) {
    console.error(e);
  } finally {
    client.end();
  }
});
