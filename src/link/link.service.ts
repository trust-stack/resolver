import {asc, eq, sql} from "drizzle-orm";
import {randomUUID} from "node:crypto";
import {DB, getDb, links} from "../db";
import {
  CreateLinkDto,
  LinkDto,
  LinkRow,
  ListLinksQueryDto,
  PaginatedLinksDto,
  UpdateLinkDto,
  buildPaginatedLinksDto,
  mapLinkRowToDto,
} from "./link.dto";
import {normalisePath, validatePath, validateType} from "./link.utils";

export class LinkService {
  constructor(private readonly db: DB) {}

  async createLink(dto: CreateLinkDto): Promise<LinkDto> {
    validatePath(dto.path);
    dto.type && validateType(dto.type);

    const [link] = await this.db
      .insert(links)
      .values({
        id: randomUUID(),
        path: normalisePath(dto.path),
        relationType: dto.relationType,
        href: dto.href,
        title: dto.title,
      })
      .returning();

    if (!link) {
      throw new Error("Failed to create link");
    }

    return mapLinkRowToDto(link, {
      href: dto.href,
      title: dto.title,
    });
  }

  async getLink(id: string): Promise<LinkDto | null> {
    const [link] = await this.db
      .select()
      .from(links)
      .where(eq(links.id, id))
      .limit(1);

    if (!link) {
      return null;
    }

    return mapLinkRowToDto(link);
  }

  async updateLink(id: string, dto: UpdateLinkDto): Promise<LinkDto | null> {
    dto.path && validatePath(dto.path);
    dto.type && validateType(dto.type);

    const updates: Partial<Omit<LinkRow, "id" | "createdAt">> = {};

    if (dto.path !== undefined) {
      updates.path = normalisePath(dto.path);
    }

    if (dto.relationType !== undefined) {
      updates.relationType = dto.relationType;
    }

    if (dto.href !== undefined) {
      updates.href = dto.href;
    }

    if (dto.title !== undefined) {
      updates.title = dto.title;
    }

    if (Object.keys(updates).length === 0) {
      return this.getLink(id);
    }

    const [link] = await this.db
      .update(links)
      .set(updates)
      .where(eq(links.id, id))
      .returning();

    if (!link) {
      return null;
    }

    return mapLinkRowToDto(link, {
      href: dto.href,
      title: dto.title,
    });
  }

  async deleteLink(id: string): Promise<boolean> {
    const deleted = await this.db
      .delete(links)
      .where(eq(links.id, id))
      .returning({id: links.id});

    return deleted.length > 0;
  }

  async listLinks(query: ListLinksQueryDto): Promise<PaginatedLinksDto> {
    const page = query.page ?? 1;
    const perPage = query.perPage ?? 10;
    const offset = (page - 1) * perPage;

    const rows = await this.db
      .select()
      .from(links)
      .orderBy(asc(links.createdAt))
      .limit(perPage)
      .offset(offset);

    const [{count}] = await this.db
      .select({count: sql<number>`count(*)`})
      .from(links);

    const total = Number(count ?? 0);

    return buildPaginatedLinksDto(rows, {
      page,
      perPage,
      total,
    });
  }
}

const createService = (() => {
  let instance: LinkService | null = null;

  return () => {
    if (!instance) {
      instance = new LinkService(getDb());
    }

    return instance;
  };
})();

export const linksService = {
  createLink: async (dto: CreateLinkDto) => createService().createLink(dto),
  getLink: async (id: string) => createService().getLink(id),
  updateLink: async (id: string, dto: UpdateLinkDto) =>
    createService().updateLink(id, dto),
  deleteLink: async (id: string) => createService().deleteLink(id),
  listLinks: async (query: ListLinksQueryDto) =>
    createService().listLinks(query),
};
