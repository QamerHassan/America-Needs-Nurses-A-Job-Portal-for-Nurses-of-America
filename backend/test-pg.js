const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:8ETj7@Zv@localhost:5432/ANNdb?schema=public'
});
client.connect().then(async () => {
    try {
        const userId = 'd32fb584-1583-4b32-b2e3-dd2c107c670a';
        const res = await client.query('SELECT id, email, role FROM "User" WHERE id = $1', [userId]);
        console.log("USER QUERY:", res.rows);

        const subRes = await client.query('SELECT * FROM "Subscription" WHERE "userId" = $1', [userId]);
        console.log("SUBSCRIPTION QUERY:", subRes.rows);
    } catch (e) {
        console.error(e);
    } finally {
        client.end();
    }
});
