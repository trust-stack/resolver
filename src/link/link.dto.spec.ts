import { LinkRow, buildPaginatedLinksDto, mapLinkRowToDto, mapLinkRowsToDto } from './link.dto';

const baseRow = (): LinkRow => ({
  id: 'link-id',
  createdAt: new Date(),
  path: 'qualifier/identifier',
  relationType: 'related',
  href: 'https://example.com',
  title: 'Example',
  type: 'text/html',
  isDefault: false,
  hreflang: ['en'],
  method: null,
  encryptionMethod: null,
  accessRole: null,
  tenantId: 'tenant_123',
  organizationId: 'org_123',
  userId: null,
});

describe('link dto mappers', () => {
  it('maps a single row to a DTO', () => {
    const row = baseRow();

    expect(mapLinkRowToDto(row)).toEqual({
      id: row.id,
      path: row.path,
      relationType: row.relationType,
      href: row.href,
      title: row.title,
      type: row.type,
      hreflang: row.hreflang,
      default: false,
    });
  });

  it('uses fallback values when href or title are missing', () => {
    const row = {
      ...baseRow(),
      href: null,
      title: null,
      type: null,
      hreflang: null,
    };

    const dto = mapLinkRowToDto(row, {
      href: 'fallback-href',
      title: 'fallback-title',
      type: 'text/html',
      hreflang: ['en'],
    });

    expect(dto).toEqual({
      id: row.id,
      path: row.path,
      relationType: row.relationType,
      href: 'fallback-href',
      title: 'fallback-title',
      type: 'text/html',
      hreflang: ['en'],
      default: false,
    });
  });

  it('throws when required fields are missing and no fallback is provided', () => {
    const row = {
      ...baseRow(),
      href: null,
    };

    expect(() => mapLinkRowToDto(row)).toThrow('Link href is required to create DTO');
  });

  it('maps multiple rows', () => {
    const dtoList = mapLinkRowsToDto([baseRow(), baseRow()]);

    expect(dtoList).toHaveLength(2);
    expect(dtoList[0].id).toBe('link-id');
  });

  it('builds a paginated dto', () => {
    const result = buildPaginatedLinksDto([baseRow()], {
      page: 2,
      perPage: 10,
      total: 25,
    });

    expect(result).toEqual({
      items: [
        {
          id: 'link-id',
          path: 'qualifier/identifier',
          relationType: 'related',
          href: 'https://example.com',
          title: 'Example',
          type: 'text/html',
          hreflang: ['en'],
          default: false,
        },
      ],
      page: 2,
      perPage: 10,
      total: 25,
      totalPages: 3,
    });
  });

  it('returns zero total pages when total is zero', () => {
    const result = buildPaginatedLinksDto([], {
      page: 1,
      perPage: 10,
      total: 0,
    });

    expect(result.totalPages).toBe(0);
    expect(result.items).toHaveLength(0);
  });
});
