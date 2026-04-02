const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:8ETj7@Zv@localhost:5432/ANNdb?schema=public'
});
client.connect().then(async () => {
  try {
    const userId = 'd32fb584-1583-4b32-b2e3-dd2e107e670a';
    const planId = 'ef9afe4e-729a-43f9-b158-5a11ac53775a'; // Gold Plan
    const status = 'PENDING_VERIFICATION';

    const res = await client.query(
      'INSERT INTO "Subscription" ("userId", "planId", "status", "startDate") VALUES ($1, $2, $3, NOW()) RETURNING *',
      [userId, planId, status]
    );
    console.log('Successfully created manual subscription:');
    console.table(res.rows);
  } catch (e) {
    console.error('Manual insertion failed:', e.message);
  } finally {
    client.end();
  }
});
