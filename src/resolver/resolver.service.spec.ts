import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../db/instance', () => ({ getDb: vi.fn() }));

import { ResolverService } from './resolver.service';

const baseRow = () => ({
  id: 'link-id',
  createdAt: new Date(),
  path: 'qualifier/identifier',
  relationType: 'untp:dpp',
  href: 'https://example.com',
  title: 'Test Link',
  type: 'text/html',
  isDefault: false,
  hreflang: ['en'],
});

type SelectChain = {
  from: ReturnType<typeof vi.fn>;
  where: ReturnType<typeof vi.fn>;
  orderBy: ReturnType<typeof vi.fn>;
};

type MockDb = {
  select: ReturnType<typeof vi.fn>;
};

const createSelectChain = (rows: any[]): SelectChain => {
  const orderBy = vi.fn().mockResolvedValue(rows);
  const where = vi.fn().mockReturnValue({ orderBy });
  const from = vi.fn().mockReturnValue({ where });
  return { from, where, orderBy };
};

describe('ResolverService', () => {
  let db: MockDb;
  let service: ResolverService;

  beforeEach(() => {
    db = {
      select: vi.fn(),
    };
    service = new ResolverService(db as any, 'https://truststack.link');
    vi.clearAllMocks();
  });

  const mockSelectOnce = (rows: any[]) => {
    const chain = createSelectChain(rows);
    db.select.mockReturnValueOnce({ from: chain.from });
    return chain;
  };

  it('redirects to default link when no query is provided', async () => {
    mockSelectOnce([{ ...baseRow(), isDefault: true }, baseRow()]);

    const result = await service.resolve('/qualifier/identifier');

    expect(result).toEqual({
      type: 'redirect',
      status: 307,
      location: 'https://example.com',
    });
  });

  it('returns not found when no default link exists', async () => {
    mockSelectOnce([baseRow()]);

    const result = await service.resolve('/qualifier/identifier');

    expect(result).toEqual({ type: 'notFound', status: 404 });
  });

  it('returns linkset when linkType is linkset', async () => {
    mockSelectOnce([
      { ...baseRow(), hreflang: ['en'] },
      { ...baseRow(), href: 'https://example.com/fr', hreflang: ['fr'] },
    ]);

    const result = await service.resolve('/qualifier/identifier', {
      linkType: 'linkset',
    });

    expect(result.type).toBe('linkset');
    expect(result.status).toBe(200);
    expect(result).toEqual({
      type: 'linkset',
      status: 200,
      body: {
        linkset: [
          {
            anchor: 'https://truststack.link/qualifier/identifier',
            linkset: [
              {
                href: 'https://example.com',
                title: 'Test Link',
                hreflang: ['en'],
                type: 'text/html',
              },
              {
                href: 'https://example.com/fr',
                title: 'Test Link',
                hreflang: ['fr'],
                type: 'text/html',
              },
            ],
          },
        ],
      },
    });
  });

  it('returns not found when linkset query has no links', async () => {
    mockSelectOnce([]);

    const result = await service.resolve('/qualifier/identifier', {
      linkType: 'linkset',
    });

    expect(result).toEqual({ type: 'notFound', status: 404 });
  });

  it('redirects when linkType matches relation type', async () => {
    mockSelectOnce([baseRow()]);

    const result = await service.resolve('/qualifier/identifier', {
      linkType: 'untp:dpp',
    });

    expect(result).toEqual({
      type: 'redirect',
      status: 307,
      location: 'https://example.com',
    });
  });

  it('returns not found when relation type not matched', async () => {
    mockSelectOnce([baseRow()]);

    const result = await service.resolve('/qualifier/identifier', {
      linkType: 'alternate',
    });

    expect(result).toEqual({ type: 'notFound', status: 404 });
  });
});
