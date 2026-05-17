import { createRoute } from '@hono/zod-openapi';

import { ErrorResponseSchema, LinksetResponseSchema, ResolverQuerySchema } from './resolver.schema';

export const resolveRoute = createRoute({
  method: 'get',
  path: '/*',
  request: {
    query: ResolverQuerySchema,
  },
  responses: {
    200: {
      description: 'Resolved linkset (RFC 9264)',
      content: {
        'application/linkset+json': { schema: LinksetResponseSchema },
      },
    },
    307: {
      description: 'Redirect to resolved link',
    },
    400: {
      description: 'Invalid request (e.g. malformed path)',
      content: {
        'application/json': { schema: ErrorResponseSchema },
      },
    },
    404: {
      description: 'No matching link',
    },
  },
});
