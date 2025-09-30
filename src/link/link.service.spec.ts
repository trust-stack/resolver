import { beforeEach, describe, expect, it, vi } from 'vitest';

const repoMock = vi.hoisted(() => ({
  createLink: vi.fn(),
  getLink: vi.fn(),
  updateLink: vi.fn(),
  deleteLink: vi.fn(),
  listLinks: vi.fn(),
}));

vi.mock('../request-context', () => ({
  getRequestContext: () => ({
    linksRepository: repoMock,
  }),
}));

import { linksService } from './link.service';

describe('linksService (functional)', () => {
  beforeEach(() => {
    repoMock.createLink.mockReset();
    repoMock.getLink.mockReset();
    repoMock.updateLink.mockReset();
    repoMock.deleteLink.mockReset();
    repoMock.listLinks.mockReset();
  });

  it('normalises path on create', async () => {
    repoMock.createLink.mockResolvedValue({
      id: 'link-id',
      path: 'qualifier/identifier',
      relationType: 'related',
      href: 'https://example.com',
      title: 'Example',
    });

    await linksService.createLink({
      path: '/qualifier/identifier',
      relationType: 'related',
      href: 'https://example.com',
      title: 'Example',
    });

    expect(repoMock.createLink).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'qualifier/identifier' }),
    );
  });

  it('delegates to repository methods', async () => {
    repoMock.getLink.mockResolvedValue(null);
    repoMock.updateLink.mockResolvedValue(null);
    repoMock.deleteLink.mockResolvedValue(true);
    repoMock.listLinks.mockResolvedValue({
      items: [],
      page: 1,
      perPage: 10,
      total: 0,
      totalPages: 0,
    });

    await expect(linksService.getLink('x')).resolves.toBeNull();
    await expect(linksService.updateLink('x', {})).resolves.toBeNull();
    await expect(linksService.deleteLink('x')).resolves.toBe(true);
    await expect(linksService.listLinks({ page: 1, perPage: 10 })).resolves.toEqual({
      items: [],
      page: 1,
      perPage: 10,
      total: 0,
      totalPages: 0,
    });
  });
});
