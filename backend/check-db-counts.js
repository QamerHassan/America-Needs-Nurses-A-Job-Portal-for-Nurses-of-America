const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:8ETj7@Zv@localhost:5432/ANNdb?schema=public'
});
client.connect().then(async () => {
  try {
    const res = await client.query('SELECT COUNT(*) FROM "Subscription"');
    console.log('TOTAL SUBSCRIPTIONS:', res.rows[0].count);
    const users = await client.query('SELECT COUNT(*) FROM "User"');
    console.log('TOTAL USERS:', users.rows[0].count);
  } catch (e) {
    console.error(e);
  } finally {
    client.end();
  }
});
