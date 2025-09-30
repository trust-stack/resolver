import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { resolve } from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const dbRef = vi.hoisted(() => ({ current: undefined as ReturnType<typeof drizzle> | undefined }));

import { defaultSqliteOptions } from 'src/infra/sqlite';
import { App, createApp } from '../src';

let sqlite: Database.Database;

const resetData = () => {
  sqlite.exec('DELETE FROM links;');
};

const authHeaders = (tenantId: string, organizationId = tenantId, userId?: string) => ({
  'x-tenant-id': tenantId,
  'x-organization-id': organizationId,
  ...(userId ? { 'x-user-id': userId } : {}),
});

type CreateLinkPayload = {
  path: string;
  relationType: string;
  href: string;
  title: string;
  type?: string;
  default?: boolean;
  hreflang?: string[];
};

describe('links CRUD e2e (auth-scoped)', () => {
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

  const create = async (payload: CreateLinkPayload, tenant = 'tenantA') => {
    const response = await app.request('/links', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...authHeaders(tenant),
      },
      body: JSON.stringify(payload),
    });
    expect(response.status).toBe(201);
    return response.json();
  };

  it('creates, retrieves, updates, lists and deletes a link', async () => {
    const payload: CreateLinkPayload = {
      path: '/qualifier/identifier',
      relationType: 'untp:dpp',
      href: 'https://example.com',
      title: 'Test Link',
      type: 'text/html',
      default: true,
      hreflang: ['en'],
    };

    // Create
    const created = await create(payload, 'tenantA');
    expect(created).toMatchObject({ title: 'Test Link', default: true });

    // Get
    const getRes = await app.request(`/links/${created.id}`, {
      headers: authHeaders('tenantA'),
    });
    expect(getRes.status).toBe(200);
    const got = await getRes.json();
    expect(got.id).toBe(created.id);

    // Update
    const updateRes = await app.request(`/links/${created.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', ...authHeaders('tenantA') },
      body: JSON.stringify({ title: 'Updated' }),
    });
    expect(updateRes.status).toBe(200);
    const updated = await updateRes.json();
    expect(updated.title).toBe('Updated');

    // List
    const listRes = await app.request('/links?page=1&perPage=10', {
      headers: authHeaders('tenantA'),
    });
    expect(listRes.status).toBe(200);
    const listBody = await listRes.json();
    expect(listBody.items.length).toBe(1);
    expect(listBody.total).toBe(1);

    // Delete
    const delRes = await app.request(`/links/${created.id}`, {
      method: 'DELETE',
      headers: authHeaders('tenantA'),
    });
    expect(delRes.status).toBe(204);

    const getAfterDelete = await app.request(`/links/${created.id}`, {
      headers: authHeaders('tenantA'),
    });
    expect(getAfterDelete.status).toBe(404);
  });

  it('enforces tenant scoping via headers', async () => {
    const payload: CreateLinkPayload = {
      path: '/qualifier/identifier',
      relationType: 'untp:dpp',
      href: 'https://example.com',
      title: 'Test Link',
    };

    const created = await create(payload, 'tenantA');

    // Try to fetch with different tenant
    const badGet = await app.request(`/links/${created.id}`, {
      headers: authHeaders('tenantB'),
    });
    expect(badGet.status).toBe(404);

    const badList = await app.request('/links?page=1&perPage=10', {
      headers: authHeaders('tenantB'),
    });
    expect(badList.status).toBe(200);
    const badListBody = await badList.json();
    expect(badListBody.total).toBe(0);
  });
});
