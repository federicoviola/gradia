import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { join } from 'path';

const dbPath = join(process.cwd(), 'local.db');

const client = createClient({
    url: `file:${dbPath}`,
});

export const db = drizzle(client, { schema });
