const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:8ETj7@Zv@localhost:5432/ANNdb?schema=public'
});
client.connect().then(async () => {
  try {
    const res = await client.query(`
      SELECT 
        c.id, 
        c.name, 
        c."logoUrl",
        COUNT(ci.id) as image_count,
        MAX(ci.url) as first_image_url
      FROM "Company" c
      LEFT JOIN "CompanyImage" ci ON c.id = ci."companyId"
      WHERE c.name ILIKE '%Peterson%'
      GROUP BY c.id, c.name, c."logoUrl"
    `);
    console.log('PETERSON COMPANY DATA:');
    console.table(res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    client.end();
  }
});
