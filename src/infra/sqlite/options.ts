import { drizzle } from 'drizzle-orm/better-sqlite3';
import { AppOptions } from 'src/index';
import * as schema from '../../db/schema';
import { LinkRepositoryCf, ResolverRepositoryCf } from '../sqlite';

export function defaultSqliteOptions(defaultDatabase?: any): AppOptions {
  // TODO: Improve typings between D1 and other sqlite drivers
  const db = defaultDatabase ?? (drizzle(process.env.DATABASE_URL!, { schema }) as any);

  return {
    linksRepository: new LinkRepositoryCf(db),
    resolverRepository: new ResolverRepositoryCf(db),
  };
}
