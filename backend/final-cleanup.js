const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:8ETj7@Zv@localhost:5432/ANNdb?schema=public'
});
client.connect().then(async () => {
  try {
    const plans = await client.query('SELECT id, name, price FROM "SubscriptionPlan"');
    console.log("PLANS IN DB:");
    console.table(plans.rows);

    const subs = await client.query('SELECT s.id, s."planId", s.status, p.name FROM "Subscription" s JOIN "SubscriptionPlan" p ON s."planId" = p.id WHERE s.status = \'PENDING_VERIFICATION\'');
    console.log("PENDING SUBSCRIPTIONS:");
    console.table(subs.rows);

    if (subs.rows.length > 0) {
      await client.query('DELETE FROM "Subscription" WHERE status = \'PENDING_VERIFICATION\'');
      console.log("Deleted all pending subscriptions to allow a fresh start.");
    }
  } catch (e) {
    console.error(e);
  } finally {
    client.end();
  }
});
