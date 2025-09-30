import { beforeEach, describe, expect, it, vi } from 'vitest';

const repoMock = vi.hoisted(() => ({ listByPath: vi.fn() }));

vi.mock('src/request-context', () => ({
  getRequestContext: () => ({
    resolverRepository: { listByPath: repoMock.listByPath },
  }),
}));

import { resolve as resolvePath } from './resolver.service';

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

describe('resolver resolve()', () => {
  beforeEach(() => {
    repoMock.listByPath.mockReset();
  });

  it('redirects to default link when no query is provided', async () => {
    repoMock.listByPath.mockResolvedValueOnce([{ ...baseRow(), isDefault: true }, baseRow()]);

    const result = await resolvePath('/qualifier/identifier');

    expect(result).toEqual({
      type: 'redirect',
      status: 307,
      location: 'https://example.com',
    });
  });

  it('returns not found when no default link exists', async () => {
    repoMock.listByPath.mockResolvedValueOnce([baseRow()]);

    const result = await resolvePath('/qualifier/identifier');

    expect(result).toEqual({ type: 'notFound', status: 404 });
  });

  it('returns linkset when linkType is linkset', async () => {
    repoMock.listByPath.mockResolvedValueOnce([
      { ...baseRow(), hreflang: ['en'] },
      { ...baseRow(), href: 'https://example.com/fr', hreflang: ['fr'] },
    ]);

    const result = await resolvePath('/qualifier/identifier', {
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
    repoMock.listByPath.mockResolvedValueOnce([]);

    const result = await resolvePath('/qualifier/identifier', {
      linkType: 'linkset',
    });

    expect(result).toEqual({ type: 'notFound', status: 404 });
  });

  it('redirects when linkType matches relation type', async () => {
    repoMock.listByPath.mockResolvedValueOnce([baseRow()]);

    const result = await resolvePath('/qualifier/identifier', {
      linkType: 'untp:dpp',
    });

    expect(result).toEqual({
      type: 'redirect',
      status: 307,
      location: 'https://example.com',
    });
  });

  it('returns not found when relation type not matched', async () => {
    repoMock.listByPath.mockResolvedValueOnce([baseRow()]);

    const result = await resolvePath('/qualifier/identifier', {
      linkType: 'alternate',
    });

    expect(result).toEqual({ type: 'notFound', status: 404 });
  });
});
