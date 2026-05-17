import { LinkRow } from '../link/link.dto';
import { normalisePath, validatePath } from '../link/link.utils';
import { getRequestContext } from '../request-context';
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
  method?: string[];
  encryptionMethod?: string;
  accessRole?: string;
};

const buildAnchor = (path: string, baseUrl: string) => {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return new URL(path, base).toString();
};

const mapRowToLinksetEntry = (row: LinkRow): LinksetEntry => {
  const entry: LinksetEntry = { href: row.href! };
  if (row.title) entry.title = row.title;
  if (row.hreflang?.length) entry.hreflang = row.hreflang;
  if (row.type) entry.type = row.type;
  if (row.method?.length) entry.method = row.method;
  if (row.encryptionMethod) entry.encryptionMethod = row.encryptionMethod;
  if (row.accessRole) entry.accessRole = row.accessRole;
  return entry;
};

const buildLinksetResult = (path: string, rows: LinkRow[]): ResolverResult => {
  const withHref = rows.filter((r) => r.href);
  if (!withHref.length) {
    return { type: 'notFound', status: 404 as const };
  }

  const anchor = buildAnchor(path, DEFAULT_BASE_URL);
  const grouped: Record<string, LinksetEntry[]> = {};
  for (const row of withHref) {
    if (row.relationType === 'anchor') continue;
    const entries = grouped[row.relationType] ?? [];
    entries.push(mapRowToLinksetEntry(row));
    grouped[row.relationType] = entries;
  }

  const anchorObject = { anchor, ...grouped } as { anchor: string } & Record<
    string,
    LinksetEntry[]
  >;

  return {
    type: 'linkset',
    status: 200 as const,
    body: {
      linkset: [anchorObject],
    },
  };
};

export async function resolve(path: string, query: ResolverQueryDto = {}): Promise<ResolverResult> {
  validatePath(path);
  const normalisedPath = normalisePath(path);
  const { resolverRepository } = getRequestContext();
  const rows = await resolverRepository.listByPath(normalisedPath);

  if (query.linkType && query.linkType.toLowerCase() === 'linkset') {
    return buildLinksetResult(normalisedPath, rows);
  }

  if (!rows.length) {
    return { type: 'notFound', status: 404 };
  }

  if (query.linkType) {
    const target = rows.find((row) => row.relationType === query.linkType);
    if (target?.href) {
      return { type: 'redirect', status: 307 as const, location: target.href };
    }
    return { type: 'notFound', status: 404 as const };
  }

  const defaultLink = rows.find((row) => row.isDefault && row.href);
  if (defaultLink?.href) {
    return { type: 'redirect', status: 307 as const, location: defaultLink.href };
  }

  return { type: 'notFound', status: 404 as const };
}
