import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const links = sqliteTable(
  'links',
  {
    id: text('id')
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    path: text('path').notNull(),
    relationType: text('relation_type').notNull(),
    href: text('href'),
    title: text('title'),
    type: text('type'),
    isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
    hreflang: text('hreflang', { mode: 'json' }).$type<string[] | null>(),
    method: text('method', { mode: 'json' }).$type<string[] | null>(),
    encryptionMethod: text('encryption_method'),
    accessRole: text('access_role'),
    tenantId: text('tenant_id').notNull(),
    organizationId: text('organization_id').notNull(),
    userId: text('user_id'),
  },
  (t) => [
    // Common lookups and pagination
    index('idx_links_path').on(t.path),
    index('idx_links_created_at').on(t.createdAt),
    // Multi-tenant scoping
    index('idx_links_tenant').on(t.tenantId),
    index('idx_links_org').on(t.organizationId),
    // Useful composite indexes
    index('idx_links_tenant_path').on(t.tenantId, t.path),
    index('idx_links_tenant_path_rel').on(t.tenantId, t.path, t.relationType),
  ],
);
