import 'server-only';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DSN;

if (!connectionString) {
  throw new Error('DSN environment variable is not set');
}

// Create the postgres client
const client = postgres(connectionString);

// Create the drizzle database instance
export const db = drizzle(client, { schema });

export type Database = typeof db;
