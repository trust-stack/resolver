import { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../../db/schema/links';

export type SqliteDb = DrizzleD1Database<typeof schema>;
