import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    // During build or if not provided, we might not have the URL
    // but we shouldn't crash unless we actually try to query
}

// For queries that don't need a persistent connection
const client = postgres(connectionString || '', { prepare: false });

export const db = drizzle(client, { schema });
