const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:8ETj7@Zv@localhost:5432/ANNdb?schema=public',
});

async function seed() {
  await client.connect();

  const insertQuery = `
    INSERT INTO "User" (id, email, password, role, status, "isOnboarded", name, "updatedAt") 
    VALUES 
      (gen_random_uuid(), 'supportadmin@ann.com', '12345678', 'SUPPORT_ADMIN', 'ACTIVE', true, 'Support Admin', NOW()),
      (gen_random_uuid(), 'contentadmin@ann.com', '87654321', 'CONTENT_ADMIN', 'ACTIVE', true, 'Content Admin', NOW())
    ON CONFLICT (email) DO UPDATE SET 
      password = EXCLUDED.password, 
      role = EXCLUDED.role, 
      status = EXCLUDED.status, 
      "isOnboarded" = EXCLUDED."isOnboarded",
      name = EXCLUDED.name,
      "updatedAt" = EXCLUDED."updatedAt";
  `;

  try {
    const res = await client.query(insertQuery);
    console.log('Admins seeded successfully:', res.rowCount, 'rows affected.');
  } catch (err) {
    console.error('Error inserting admins:', err);
  } finally {
    await client.end();
  }
}

seed();
