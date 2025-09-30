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
  })
  .openapi({ description: 'Linkset entry' });

export const LinksetResponseSchema = z
  .object({
    linkset: z.array(
      z.object({
        anchor: z.string().url(),
        linkset: z.array(LinksetEntrySchema),
      }),
    ),
  })
  .openapi({ description: 'Linkset response payload' });
