import z from 'zod';

import { links } from '../db/schema';
import {
  CreateLinkSchema,
  LinkSchema,
  ListLinksQuerySchema,
  PaginatedLinksSchema,
  UpdateLinkSchema,
} from './link.schema';

export type CreateLinkDto = z.infer<typeof CreateLinkSchema>;
export type LinkDto = z.infer<typeof LinkSchema>;
export type UpdateLinkDto = z.infer<typeof UpdateLinkSchema>;
export type ListLinksQueryDto = z.infer<typeof ListLinksQuerySchema>;
export type PaginatedLinksDto = z.infer<typeof PaginatedLinksSchema>;

export type LinkRow = typeof links.$inferSelect;
type LinkDtoFallback = Pick<LinkDto, 'href' | 'title' | 'type' | 'hreflang' | 'default'>;

export function mapLinkRowToDto(row: LinkRow, fallback?: Partial<LinkDtoFallback>): LinkDto {
  const href = row.href ?? fallback?.href;
  const title = row.title ?? fallback?.title;
  const type = row.type ?? fallback?.type;
  const hreflang = row.hreflang ?? fallback?.hreflang;
  const isDefault = row.isDefault ?? fallback?.default;

  if (href == null) {
    throw new Error('Link href is required to create DTO');
  }

  if (title == null) {
    throw new Error('Link title is required to create DTO');
  }

  return {
    id: row.id,
    path: row.path,
    relationType: row.relationType,
    href,
    title,
    type,
    hreflang,
    default: isDefault ?? undefined,
  };
}

export function mapLinkRowsToDto(rows: LinkRow[], fallback?: Partial<LinkDtoFallback>): LinkDto[] {
  return rows.map((row) => mapLinkRowToDto(row, fallback));
}

export function buildPaginatedLinksDto(
  rows: LinkRow[],
  meta: { page: number; perPage: number; total: number },
  fallback?: Partial<LinkDtoFallback>,
): PaginatedLinksDto {
  const items = mapLinkRowsToDto(rows, fallback);
  const totalPages = meta.total === 0 ? 0 : Math.ceil(meta.total / meta.perPage);

  return {
    items,
    page: meta.page,
    perPage: meta.perPage,
    total: meta.total,
    totalPages,
  };
}
