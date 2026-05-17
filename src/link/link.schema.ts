import { z } from '@hono/zod-openapi';

export const LinkIdSchema = z.object({
  id: z.string().openapi({ example: 'link_123' }),
});

export const CreateLinkSchema = z
  .object({
    path: z.string().openapi({ example: 'entity/abc' }),
    relationType: z.string().openapi({ example: 'related' }),
    href: z.string().url().openapi({ example: 'https://example.com' }),
    title: z.string().openapi({ example: 'Example' }),
    type: z.string().optional().openapi({ example: 'application/json' }),
    default: z.boolean().optional().openapi({ example: true }),
    hreflang: z
      .array(z.string())
      .optional()
      .openapi({ example: ['en'] }),
    method: z
      .array(z.string())
      .optional()
      .openapi({ example: ['GET'] }),
    encryptionMethod: z.string().optional().openapi({ example: 'none' }),
    accessRole: z.string().optional().openapi({ example: 'untp:accessRole#Anonymous' }),
  })
  .openapi({ description: 'Payload to create a link' });

export const UpdateLinkSchema = CreateLinkSchema.partial().openapi({
  description: 'Partial update payload for a link',
});

export const LinkSchema = z
  .object({
    id: z.string(),
    path: z.string(),
    relationType: z.string(),
    href: z.string(),
    title: z.string(),
    type: z.string().optional(),
    default: z.boolean().optional(),
    hreflang: z.array(z.string()).optional(),
    method: z.array(z.string()).optional(),
    encryptionMethod: z.string().optional(),
    accessRole: z.string().optional(),
  })
  .openapi({ description: 'Link representation' });

export const ListLinksQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1).openapi({ example: 1 }),
    perPage: z.coerce.number().int().min(1).max(100).default(10).openapi({ example: 10 }),
  })
  .openapi({ description: 'Pagination parameters' });

export const PaginatedLinksSchema = z
  .object({
    items: z.array(LinkSchema),
    page: z.number().int().min(1),
    perPage: z.number().int().min(1),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
  })
  .openapi({ description: 'Paginated list of links' });
