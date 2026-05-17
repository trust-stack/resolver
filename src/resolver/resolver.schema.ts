import { z } from '@hono/zod-openapi';

export const ResolverQuerySchema = z
  .object({
    linkType: z.string().optional().openapi({ example: 'linkset' }),
  })
  .openapi({ description: 'Resolver query parameters' });

export const LinksetEntrySchema = z
  .object({
    href: z.string().url(),
    title: z.string().optional(),
    hreflang: z.array(z.string()).optional(),
    type: z.string().optional(),
    method: z.array(z.string()).optional(),
    encryptionMethod: z.string().optional(),
    accessRole: z.string().optional(),
  })
  .openapi({ description: 'Linkset entry (RFC 9264)' });

export const LinksetAnchorSchema = z
  .object({
    anchor: z.string().url(),
  })
  .catchall(z.array(LinksetEntrySchema))
  .openapi({ description: 'Linkset anchor object with relation type keys per RFC 9264' });

export const LinksetResponseSchema = z
  .object({
    linkset: z.array(LinksetAnchorSchema),
  })
  .openapi({ description: 'Linkset response payload (RFC 9264)' });
