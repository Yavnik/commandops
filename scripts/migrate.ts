import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const client = postgres(url, { max: 1 });
const db = drizzle(client);

try {
  await migrate(db, { migrationsFolder: 'drizzle' });
  console.log('Migrations applied successfully');
  process.exit(0);
} catch (err) {
  console.error('Migration failed:', err);
  process.exit(1);
} finally {
  await client.end({ timeout: 1 });
}


