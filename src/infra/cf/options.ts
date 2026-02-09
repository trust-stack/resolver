import { drizzle } from 'drizzle-orm/d1';
import { AppOptions } from '../../';
import * as schema from '../../db/schema';
import { LinkRepositoryCf, ResolverRepositoryCf } from '../sqlite';

export function defaultCfOptions(d1: any): AppOptions {
  const db = drizzle(d1, { schema });
  return {
    linksRepository: new LinkRepositoryCf(db),
    resolverRepository: new ResolverRepositoryCf(db),
  };
}
