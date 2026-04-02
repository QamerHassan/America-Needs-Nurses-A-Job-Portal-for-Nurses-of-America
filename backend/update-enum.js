const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:8ETj7@Zv@localhost:5432/ANNdb?schema=public'
});
client.connect().then(async () => {
  try {
    await client.query('ALTER TYPE "SubscriptionStatus" ADD VALUE IF NOT EXISTS \'PENDING_VERIFICATION\'');
    console.log('Enum updated successfully to include PENDING_VERIFICATION');
  } catch (e) {
    console.error("Error creating enum:", e.message);
  } finally {
    client.end();
  }
});
