import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { resolve } from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../src';

const dbRef = vi.hoisted(() => ({
  current: undefined as ReturnType<typeof drizzle> | undefined,
}));

import { defaultSqliteOptions } from 'src/infra/sqlite';
import { createApp } from '../src';

let sqlite: Database.Database;

const resetData = () => {
  sqlite.exec('DELETE FROM links;');
};

type CreateLinkPayload = {
  path: string;
  relationType: string;
  href: string;
  title: string;
  type?: string;
  default?: boolean;
  hreflang?: string[];
};

describe('resolver e2e', () => {
  let app: App;

  beforeAll(async () => {
    sqlite = new Database(':memory:');
    dbRef.current = drizzle(sqlite);
    await migrate(dbRef.current, {
      migrationsFolder: resolve(process.cwd(), 'drizzle'),
    });
    app = createApp(defaultSqliteOptions(dbRef.current as any));
  });

  afterAll(() => {
    sqlite.close();
  });

  beforeEach(() => {
    resetData();
  });

  const createLink = async (payload: CreateLinkPayload) => {
    const response = await app.request('/links', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-organization-id': '123',
        'x-tenant-id': '456',
      },
      body: JSON.stringify(payload),
    });

    expect(response.status).toBe(201);
    return response.json();
  };

  describe('default redirects', () => {
    it('redirects to the default link of the underlying link set', async () => {
      const dto: CreateLinkPayload = {
        path: '/qualifier/identifier',
        relationType: 'untp:dpp',
        href: 'https://example.com',
        title: 'Test Link',
        type: 'text/html',
        default: true,
        hreflang: ['en'],
      };

      await createLink(dto);

      const response = await app.request('/qualifier/identifier');

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(dto.href);
    });

    it('returns a 404 if no default link is found', async () => {
      const dto: CreateLinkPayload = {
        path: '/qualifier/identifier',
        relationType: 'alternate',
        href: 'https://example.com',
        title: 'Test Link',
        type: 'text/html',
        hreflang: ['en'],
      };

      await createLink(dto);

      const response = await app.request('/qualifier/identifier');

      expect(response.status).toBe(404);
    });
  });

  describe('linkType=linkset', () => {
    it('returns all links in the underlying link set', async () => {
      const base: CreateLinkPayload = {
        path: '/qualifier/identifier',
        relationType: 'untp:dpp',
        href: 'https://example.com',
        title: 'Test Link',
        type: 'text/html',
        hreflang: ['en'],
      };

      await createLink({ ...base });
      await createLink({
        ...base,
        href: 'https://example.com/fr',
        hreflang: ['fr'],
      });

      const response = await app.request('/qualifier/identifier?linkType=linkset');

      expect(response.status).toBe(200);
      const body = await response.json();

      expect(body).toEqual({
        linkset: [
          {
            anchor: 'https://truststack.link/qualifier/identifier',
            linkset: expect.arrayContaining([
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
            ]),
          },
        ],
      });
    });

    it('returns 404 if no links exist', async () => {
      const response = await app.request('/qualifier/identifier?linkType=linkset');

      expect(response.status).toBe(404);
    });
  });

  describe('linkType query parameter', () => {
    it('redirects when the relation type matches', async () => {
      const dto: CreateLinkPayload = {
        path: '/qualifier/identifier',
        relationType: 'untp:dpp',
        href: 'https://example.com',
        title: 'Test Link',
        type: 'text/html',
        hreflang: ['en'],
      };

      await createLink(dto);

      const response = await app.request('/qualifier/identifier?linkType=untp:dpp');

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(dto.href);
    });

    it('returns 404 when relation type does not match', async () => {
      const dto: CreateLinkPayload = {
        path: '/qualifier/identifier',
        relationType: 'gs1:pip',
        href: 'https://example.com',
        title: 'Test Link',
        type: 'text/html',
        hreflang: ['en'],
      };

      await createLink(dto);

      const response = await app.request('/qualifier/identifier?linkType=untp:dpp');

      expect(response.status).toBe(404);
    });
  });
});
