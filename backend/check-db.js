const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:8ETj7@Zv@localhost:5432/ANNdb?schema=public'
});
client.connect().then(async () => {
  try {
    const userId = 'd32fb584-1583-4b32-b2e3-dd2e107e670a';
    const u = await client.query('SELECT * FROM "User" WHERE id = $1', [userId]);
    console.log('USER QUERY:', u.rows);
    const s = await client.query('SELECT * FROM "Subscription" WHERE "userId" = $1', [userId]);
    console.log('SUBSCRIPTION QUERY:', s.rows);
    const plans = await client.query('SELECT * FROM "SubscriptionPlan"');
    console.log('PLANS:', plans.rows.length);
  } catch (e) {
    console.error(e);
  } finally {
    client.end();
  }
});
