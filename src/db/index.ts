import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

function validateDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  return url;
}

export const db = drizzle(validateDatabaseUrl());
