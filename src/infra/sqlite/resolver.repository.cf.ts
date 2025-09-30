import { asc, eq } from 'drizzle-orm';
import { SqliteDb } from '.';
import { links } from '../../db/schema';
import { LinkRow } from '../../link/link.dto';
import { ResolverRepository } from '../../resolver/resolver.repository';

export class ResolverRepositoryCf implements ResolverRepository {
  constructor(private readonly db: SqliteDb) {}

  async listByPath(path: string): Promise<LinkRow[]> {
    return this.db.select().from(links).where(eq(links.path, path)).orderBy(asc(links.createdAt));
  }
}
