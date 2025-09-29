import 'server-only';

import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let dbInstance: PostgresJsDatabase<typeof schema> | null = null;

function createDbInstance(): PostgresJsDatabase<typeof schema> {
  const connectionString = process.env.DSN;

  if (!connectionString) {
    throw new Error('DSN environment variable is not set');
  }

  const client = postgres(connectionString);
  return drizzle(client, { schema });
}

export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!dbInstance) {
    dbInstance = createDbInstance();
  }

  return dbInstance;
}

export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    const instance = getDb();
    const value = Reflect.get(instance, prop, receiver);

    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

export type Database = ReturnType<typeof getDb>;
