const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:8ETj7@Zv@localhost:5432/ANNdb?schema=public'
});
client.connect().then(async () => {
  try {
    const res = await client.query('SELECT s.id, s."planId", s.status, p.name FROM "Subscription" s JOIN "SubscriptionPlan" p ON s."planId" = p.id WHERE s.status = \'PENDING_VERIFICATION\'');
    console.log("Current Pending Subscriptions:");
    console.table(res.rows);
    
    // Auto-delete the basic ones so the user can literally just try again
    const delRes = await client.query('DELETE FROM "Subscription" WHERE status = \'PENDING_VERIFICATION\'');
    console.log(`Deleted ${delRes.rowCount} pending subscriptions.`);
    
  } catch (e) {
    console.error(e);
  } finally {
    client.end();
  }
});
