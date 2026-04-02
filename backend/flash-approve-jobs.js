const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:8ETj7@Zv@localhost:5432/ANNdb?schema=public'
});
client.connect().then(async () => {
  try {
    // Update all PENDING jobs where the associated company is APPROVED
    const res = await client.query(`
      UPDATE "Job"
      SET "status" = 'APPROVED'
      WHERE "status" = 'PENDING'
      AND "companyId" IN (SELECT id FROM "Company" WHERE "status" = 'APPROVED')
    `);
    console.log(`Successfully auto-approved ${res.rowCount} previously pending jobs.`);

  } catch (e) {
    console.error(e);
  } finally {
    client.end();
  }
});
