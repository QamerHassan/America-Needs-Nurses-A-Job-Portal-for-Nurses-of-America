const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:8ETj7@Zv@localhost:5432/ANNdb?schema=public'
});
client.connect().then(async () => {
  try {
    const res = await client.query('SELECT s.id, s."planId", s.status, s."createdAt", p.name, p.price FROM "Subscription" s JOIN "SubscriptionPlan" p ON s."planId" = p.id ORDER BY s."createdAt" DESC LIMIT 5');
    console.table(res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    client.end();
  }
});
