const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:8ETj7@Zv@localhost:5432/ANNdb?schema=public'
});
client.connect().then(async () => {
  try {
    const res = await client.query(`
      SELECT title, status, "companyId" 
      FROM "Job" 
      WHERE title ILIKE '%Travel nurse%' 
      OR title ILIKE '%ICU%' 
      OR title ILIKE '%Registerd Nurse%'
    `);
    console.log('JOB STATUSES:');
    console.table(res.rows);

    const companiesRes = await client.query(`
      SELECT id, name, status 
      FROM "Company" 
      WHERE id IN (${res.rows.map(r => `'${r.companyId}'`).join(',')})
    `);
    console.log('COMPANY STATUSES:');
    console.table(companiesRes.rows);

  } catch (e) {
    console.error(e);
  } finally {
    client.end();
  }
});
