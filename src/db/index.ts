import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');
  return url;
}

const client = postgres(requireDatabaseUrl());
export const db = drizzle(client);