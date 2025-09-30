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

import { createLink, deleteLink, getLink, listLinks, updateLink } from './link.service';

describe('link service functions', () => {
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

    await createLink({
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

    await expect(getLink('x')).resolves.toBeNull();
    await expect(updateLink('x', {})).resolves.toBeNull();
    await expect(deleteLink('x')).resolves.toBe(true);
    await expect(listLinks({ page: 1, perPage: 10 })).resolves.toEqual({
      items: [],
      page: 1,
      perPage: 10,
      total: 0,
      totalPages: 0,
    });
  });
});
