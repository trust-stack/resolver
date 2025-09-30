import { asc, eq } from 'drizzle-orm';

import { getDb } from '../db/instance';
import { links } from '../db/schema';
import { DB } from '../db/types';
import { normalisePath, validatePath } from '../link/link.utils';
import { LinksetResponseDto, ResolverQueryDto } from './resolver.dto';

const DEFAULT_BASE_URL = process.env.RESOLVER_BASE_URL ?? 'https://truststack.link';

export type RedirectResult = {
  type: 'redirect';
  status: 307;
  location: string;
};

export type LinksetResult = {
  type: 'linkset';
  status: 200;
  body: LinksetResponseDto;
};

export type NotFoundResult = {
  type: 'notFound';
  status: 404;
};

export type ResolverResult = RedirectResult | LinksetResult | NotFoundResult;

export type LinksetEntry = {
  href: string;
  title?: string;
  hreflang?: string[];
  type?: string;
};

export class ResolverService {
  constructor(
    private readonly db: DB,
    private readonly baseUrl: string = DEFAULT_BASE_URL,
  ) {}

  async resolve(path: string, query: ResolverQueryDto = {}): Promise<ResolverResult> {
    validatePath(path);
    const normalisedPath = normalisePath(path);
    const rows = await this.db
      .select()
      .from(links)
      .where(eq(links.path, normalisedPath))
      .orderBy(asc(links.createdAt));

    if (query.linkType && query.linkType.toLowerCase() === 'linkset') {
      return this.buildLinksetResult(normalisedPath, rows);
    }

    if (!rows.length) {
      return { type: 'notFound', status: 404 };
    }

    if (query.linkType) {
      const target = rows.find((row) => row.relationType === query.linkType);
      if (target?.href) {
        return {
          type: 'redirect',
          status: 307 as const,
          location: target.href,
        };
      }
      return { type: 'notFound', status: 404 as const };
    }

    const defaultLink = rows.find((row) => row.isDefault && row.href);
    if (defaultLink?.href) {
      return {
        type: 'redirect',
        status: 307 as const,
        location: defaultLink.href,
      };
    }

    return { type: 'notFound', status: 404 as const };
  }

  private buildLinksetResult(path: string, rows: (typeof links.$inferSelect)[]): ResolverResult {
    if (!rows.length) {
      return { type: 'notFound', status: 404 as const };
    }

    const anchor = this.buildAnchor(path);
    const linksetEntries = rows
      .filter((row) => row.href)
      .map((row) => this.mapRowToLinksetEntry(row));

    if (!linksetEntries.length) {
      return { type: 'notFound', status: 404 as const };
    }

    return {
      type: 'linkset',
      status: 200 as const,
      body: {
        linkset: [
          {
            anchor,
            linkset: linksetEntries,
          },
        ],
      },
    };
  }

  private mapRowToLinksetEntry(row: typeof links.$inferSelect): LinksetEntry {
    const entry: LinksetEntry = {
      href: row.href!,
    };

    if (row.title) {
      entry.title = row.title;
    }

    if (row.hreflang?.length) {
      entry.hreflang = row.hreflang;
    }

    if (row.type) {
      entry.type = row.type;
    }

    return entry;
  }

  private buildAnchor(path: string) {
    const base = this.baseUrl.endsWith('/') ? this.baseUrl : `${this.baseUrl}/`;
    return new URL(path, base).toString();
  }
}

const createService = (() => {
  let instance: ResolverService | null = null;

  return () => {
    if (!instance) {
      instance = new ResolverService(getDb());
    }

    return instance;
  };
})();

export const resolverService = {
  resolve: async (path: string, query: ResolverQueryDto = {}) =>
    createService().resolve(path, query),
};
