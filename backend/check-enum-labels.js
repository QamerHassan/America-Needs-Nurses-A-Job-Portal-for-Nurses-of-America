const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:8ETj7@Zv@localhost:5432/ANNdb?schema=public'
});
client.connect().then(async () => {
  try {
    const res = await client.query("SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE typname = 'SubscriptionStatus'");
    console.log("Current Postgres Enum Values for SubscriptionStatus:");
    console.table(res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    client.end();
  }
});
