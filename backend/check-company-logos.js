const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:8ETj7@Zv@localhost:5432/ANNdb?schema=public'
});
client.connect().then(async () => {
  try {
    const res = await client.query(`
      SELECT id, name, "logoUrl" FROM "Company" 
      WHERE name ILIKE '%Northshore%' OR name ILIKE '%Peterson%'
    `);
    console.log('COMPANY DATA:');
    console.table(res.rows);

  } catch (e) {
    console.error(e);
  } finally {
    client.end();
  }
});
