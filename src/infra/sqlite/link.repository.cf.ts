import { and, asc, eq, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { SqliteDb } from '.';
import { links } from '../../db/schema';
import {
  CreateLinkDto,
  LinkDto,
  LinkRow,
  ListLinksQueryDto,
  PaginatedLinksDto,
  UpdateLinkDto,
  buildPaginatedLinksDto,
  mapLinkRowToDto,
} from '../../link/link.dto';
import { LinkRepository } from '../../link/link.repository';
import { getRequestContext } from '../../request-context';

export class LinkRepositoryCf implements LinkRepository {
  constructor(private readonly db: SqliteDb) {}

  async createLink(dto: CreateLinkDto): Promise<LinkDto> {
    const { auth } = getRequestContext();
    const [row] = await this.db
      .insert(links)
      .values({
        id: randomUUID(),
        path: dto.path,
        relationType: dto.relationType,
        href: dto.href,
        title: dto.title,
        type: dto.type,
        isDefault: dto.default ?? false,
        hreflang: dto.hreflang as LinkRow['hreflang'],
        method: dto.method as LinkRow['method'],
        encryptionMethod: dto.encryptionMethod,
        accessRole: dto.accessRole,
        tenantId: auth.tenantId,
        organizationId: auth.organizationId,
        userId: auth.userId,
      })
      .returning();

    if (!row) {
      throw new Error('Failed to create link');
    }

    return mapLinkRowToDto(row, {
      href: dto.href,
      title: dto.title,
      type: dto.type,
      hreflang: dto.hreflang,
      default: dto.default,
    });
  }

  async getLink(id: string): Promise<LinkDto | null> {
    const { auth } = getRequestContext();
    const [row] = await this.db
      .select()
      .from(links)
      .where(and(eq(links.id, id), eq(links.tenantId, auth.tenantId)))
      .limit(1);
    if (!row) return null;
    return mapLinkRowToDto(row);
  }

  async updateLink(id: string, dto: UpdateLinkDto): Promise<LinkDto | null> {
    const { auth } = getRequestContext();
    const updates: Partial<Omit<LinkRow, 'id' | 'createdAt'>> = {};

    if (dto.path !== undefined) updates.path = dto.path;
    if (dto.relationType !== undefined) updates.relationType = dto.relationType;
    if (dto.href !== undefined) updates.href = dto.href;
    if (dto.title !== undefined) updates.title = dto.title;
    if (dto.type !== undefined) updates.type = dto.type;
    if (dto.default !== undefined) updates.isDefault = dto.default;
    if (dto.hreflang !== undefined) updates.hreflang = dto.hreflang as LinkRow['hreflang'];
    if (dto.method !== undefined) updates.method = dto.method as LinkRow['method'];
    if (dto.encryptionMethod !== undefined) updates.encryptionMethod = dto.encryptionMethod;
    if (dto.accessRole !== undefined) updates.accessRole = dto.accessRole;

    if (Object.keys(updates).length === 0) {
      return this.getLink(id);
    }

    const [row] = await this.db
      .update(links)
      .set(updates)
      .where(and(eq(links.id, id), eq(links.tenantId, auth.tenantId)))
      .returning();

    if (!row) return null;

    return mapLinkRowToDto(row, {
      href: dto.href,
      title: dto.title,
      type: dto.type,
      hreflang: dto.hreflang,
      default: dto.default,
    });
  }

  async deleteLink(id: string): Promise<boolean> {
    const { auth } = getRequestContext();
    const deleted = await this.db
      .delete(links)
      .where(and(eq(links.id, id), eq(links.tenantId, auth.tenantId)))
      .returning({ id: links.id });
    return deleted.length > 0;
  }

  async listLinks(query: ListLinksQueryDto): Promise<PaginatedLinksDto> {
    const { auth } = getRequestContext();
    const page = query.page ?? 1;
    const perPage = query.perPage ?? 10;
    const offset = (page - 1) * perPage;

    const rows = await this.db
      .select()
      .from(links)
      .where(eq(links.tenantId, auth.tenantId))
      .orderBy(asc(links.createdAt))
      .limit(perPage)
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(links)
      .where(eq(links.tenantId, auth.tenantId));
    const total = Number(count ?? 0);

    return buildPaginatedLinksDto(rows, { page, perPage, total });
  }
}
